---
date: 2024-03-12
title: Spring Event로 강결합 해결하기
---


## 강결합으로 인한 문제 상황

남의위키는 누군가가 나에게 설문을 작성해주면, 그에 대한 약간의 통계 자료들을 대시보드를 통해 확인할 수 있다.
그래서 대시보드 데이터들을 dashboard Collection에 따로 저장해두고 있다.

설문이 생성되면, 관련된 dashboard를 업데이트해주어야 했다.

```java
public CreateSurveyResponse createSurvey(CreateSurveyRequest request, String accessToken) {
	
	// ... Survey 생성  
	  
	dashboardService.updateStatistics(survey);  
	statisticsService.updateStatistics(survey);  
	  
	return new CreateSurveyResponse(survey.getId());  
}
```

그 결과 이들 사이에 강결합이 발생했다.

```
SurveyService <--> DashboardService, StatisticService 
```


통계를 업데이트 하는 기능은 설문을 "생성"하는 기능과는 관련이 없다.
통계 업데이트를 설문 생성이 완료되면 실행해야 하는 건 맞지만, 설문 생성하는 것 자체에는 관여를 하지 않는다.

여기서 발생하는 문제는 3가지이다.
1. 강결합 발생 : 통계 업데이트가 실패한다면, 설문 생성에 성공했음에도 사용자의 요청은 실패로 반환된다.
2. 필요 없는 의존성 발생 : 설문 생성 메소드에서 자기 책임이 아닌 통계 업데이트까지 맡고 있다.
3. 필요 없는 동기적인 실행 : 사용자는 설문 생성뿐만 아니라 통계 업데이트가 되는 시간까지 기다려야 한다.


## 번외: 트랜잭션

남의위키는 MongoDB를 사용하고 있다. 몽고db는 트랜잭션을 걸려면, replica를 3개 이상 사용해야 한다.
하지만 리소스가 없는 우리 팀에서는 그 정도로 사용할 수 없어서 트랜잭션을 사용할 수 없는 상황이다.

그래서 1번 문제점이 발생한 것이다. 
만약 이 `createSurvey()` 메소드에 트랜잭션이 걸려 있다면, 통계를 업데이트하는 것이 실패하면 사용자가 생성한 Survey 생성도 실패한다.
이럴 경우 설문 생성 자체에 문제가 발생한 게 아님에도 사용자는 다시 설문을 작성해야 하는 번거로움이 발생한다.

지금은 트랜잭션을 사용하지 않기 때문에 통계 업데이트가 실패해도 설문 생성이 롤백되지 않는다.
하지만 그럼에도 사용자는 여전히 설문 생성이 실패했다는 응답을 받게 된다.


## 비동기 처리 `@Async`

1번과 3번 문제점을 해결하기 위해 통계 업데이트 메소드를 비동기 실행되도록 `@Async` 어노테이션을 사용했다.

```java
// DashboardService
@Async  
public void updateStatistics(Survey survey) {
	// update dashboard...
}
```


이 비동기 메소드는 createSurvey를 실행하던 스레드와는 다른 스레드에서 실행된다. 
그래서 설문 생성이 성공하면 사용자는 성공으로 응답받는다. 그리고 통계 업데이트가 끝날 때까지 기다리지도 않게 되었다.

하지만 다른 스레드에서 실행됨에 따라 기존의 RestControllerAdvice로 비동기 메소드에서 발생한 예외를 처리할 수 없게 되었다.

비동기 예외를 처리하는 핸들러를 추가했다.

```java
public class AsyncExceptionHandler implements AsyncUncaughtExceptionHandler {  
  
	@Override  
	public void handleUncaughtException(Throwable ex, Method method, Object... params) {  
		log.error("AsyncException message={}, declaringClass={}, methodName={}", ex.getMessage(), method.getDeclaringClass(), method.getName(), ex);  
		  
		for (Object param : params) {  
		log.error("Parameter value - {}, declaringClass={}, methodName={}", param, method.getDeclaringClass(), method.getName());  
		}  
	  
	}  
  
}
```



## 이벤트 발행

2번 문제를 해결하기 위해서 Spring에서 제공하는 Event 기능을 사용했다.
설문 생성 후, 설문 생성이 성공했다는 이벤트를 발행한다.

```java
public CreateSurveyResponse createSurvey(CreateSurveyRequest request, String accessToken) {
	
	// ... Survey 생성  
	  
	applicationEventPublisher.publishEvent(new CreateSurveySuccessEvent(survey));
	  
	return new CreateSurveyResponse(survey.getId());  
}
```


그리고 SurveyEventHandler를 통해서 이 이벤트를 구독하도록 수정했다.

```java
public class SurveyEventHandler {  
	private final StatisticsService statisticsService;  
	private final DashboardService dashboardService;  
	  
	@Async  
	@EventListener  
	public void handleSurveySuccessEvent(CreateSurveySuccessEvent event) {  
		Survey survey = event.getSurvey();  
		log.info("SurveyEventHandler.handleSurveySuccessEvent: surveyId={}", survey.getId());  
		  
		dashboardService.updateStatistics(survey);  
		statisticsService.updateStatistics(survey);  
	}  
	  
}
```


이 과정에서 데이터 무결성 문제가 발생할 수도 있다. 
설문 생성이 완료돼서 이벤트가 발생된 후에, 설문 데이터가 수정되는 일이 발생하면 통계 업데이트는 잘못된 데이터를 가지고 수행하게 된다.

남의위키는 설문을 수정할 수 없지만, 이 기능이 있을 경우 어떻게 하면 좋을까에 대해서 생각을 해보았다.

1. surveyId로 이벤트 발행
현재는 `CreateSurveySuccessEvent`를 발행할 때 `Survey` 객체 자체를 넘긴다.
이렇게 하지 않고 생성된 `surveyId`를 넘기고, 이벤트를 구독하는 쪽에서 트랜잭션을 걸어서 통계를 업데이트하면 될 것 같았다.

DB를 다시 조회해야 한다는 단점이 있지만, 데이터의 정확성이 중요할 경우 이렇게 진행할 수 있겠다.

2. `@TransactionalEventListener` 사용

`@Async`와 `@TransactionalEventListener`를 함께 사용한다면, 이전 트랜잭션이 commit된 이후 새로운 스레드에서 새로은 트랜잭션을 수행할 수 있다.

그럼 생성된 survey를 이어 받아서 업데이트 로직을 수행할 수 있게 된다.



## 결과


그래서 결과는 이러하다. 성능이 이만큼 좋아졌다.


### 참고자료
- https://dzone.com/articles/effective-advice-on-spring-async-part-1
- https://www.baeldung.com/spring-async


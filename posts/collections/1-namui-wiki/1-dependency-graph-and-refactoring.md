---
date: 2024-03-04
title: 남의위키 의존성 그래프를 그려보기
---

## 의존성 그래프 그리기

조영호님의 우아한 객체지향 세미나를 듣고, 남의위키의 그래프를 의존성 그래프를 그려보았다.
피그잼으로 직접 확인 : [FigJam Board Link](https://www.figma.com/file/cHyXPGQt9F8ylOfA8yReKA/%EB%82%A8%EC%9D%98%EC%9C%84%ED%82%A4-%EC%9D%98%EC%A1%B4%EC%84%B1-%EA%B7%B8%EB%9E%98%ED%94%84?type=whiteboard&node-id=0%3A1&t=IoGPNS0GwPCLLthF-1)

결과는 대충격 🤯

대충 예상은 했지만, 엄청나게 많은 의존성이 엮여 있고 분리가 안되어 있어서 복잡했다.
심지어 User 도메인은 그리지도 않았는데 말이다...

최대한 보기 좋고 예쁜 그래프를 그리려다가 Dashboard 그릴 때부터 포기했다.
![image](Pasted-image-20240307035419.png)

파랑 : Repository
빨강 : Service
노랑 : Entity
보라 : Model, Interface, etc...

### 문제점 파악

참조 그래프를 그렸을 때 명확하게 보이는 부분이 몇 가지 있었다.(빨간 박스로 표시)

1. SurveyAnswer 객체는 제거하고, Survey로 통합해야 한다.
2. Statistic과 Statistics는 Dashboard 도메인에서만 사용되는데, Statistic 도메인에 속해있다.
   - Statistic은 남의위키의 전체 통계이고 Dashboard는 사용자의 통계 인데, 이전에 PopulationStatistic 추가되면서 용어가 변경되지 않았다.
3. Question은 어떤 도메인이든 직접 혹은 간접적으로 사용되는데, 여기저기서 사용하지 않게끔 변경할 수 있을까?

눈이 보이는 것이 이 정도 이고, 테스트코드 작성과 리팩토링 하는 과정에서 문제점을 더 구체화하였다.

## 리팩토링 사항

### SurveyAnswer 제거

SurveyAnswer/Answer 와 Survey/Answer의 역할이 동일하여 SurveyAnswer를 제거했다.

기존에 Survey와 SurveyAnswer를 나누었던 이유는 Entity에 비즈니스로직을 넣기보다 Model를 사용해서 액션을 취하는 게 더 맞다고 생각한 것과 요청으로 담겨져온 Answer에 대해서 검증할 것이 많다는 점 때문이었다.

그리고 제거하게 된 이유는 다음과 같다.

1. Entity 안에서 비즈니스 로직 수행
   DDD를 알게 되면서 Entity 안에서 비즈니스 로직을 수행하는 것이 적절한 경우가 있다는 것을 알게 되었다.
2. 비즈니스 로직이 Entity와 밀접하게 연관
   Model과의 차이로는 어떤 로직이 Entity와 밀접한 관계에 있냐는 것인데, Survey의 경우는 밀접하다못해 그 자체이다.

그래서 Model 이었던 SurveyAnswer를 제거하고, Entity인 Survey로 코드를 옮겼다.
이에 따라서 SurveyAnswer.Answer도 제거하게 되고, Survey.Answer로 합쳤다.

기존에 이랬던 것이
![image](Pasted-image-20240305165101.png)

빨간 박스가 사라져 이렇게 되었다.
![image](Pasted-image-20240305165126.png)

### Statistics와 Statistic을 Dashboard 도메인으로 이동

이동만 한다고 모두 해결되는 것은 아니다.

statistics에서는

1. 유저의 대시보드 업데이트
2. 전체 통계량 업데이트
   2가지 일을 하고 있다.

dashboard에서는 DB에 있는 데이터를 가져와 DTO로 변환하는 로직을 가지고 있다.

클래스를 이동한 후에, 대시보드에 대한 응집도를 높이기 위해 statistic의 1번을 dashboard에서 처리하도록 수정해야 한다.

유저가 설문을 생성하면, 해당 설문을 저장한 후에 유저 통계를 업데이트한다.
![image](Pasted-image-20240305181013.png)

이 `statisticsService`에서 통계를 업데이트하는 메소드에 유저의 통계량과 전체 통계량 업데이트하는 로직이 섞여 있어 복잡해진 것 같다. (이것들은 나중에 event 기반으로 변경할 예정이지만 지금은 의존성 정리를 먼저할 것이다.)

그래서 일단 이 둘을 분리하도록 한다.
SurveyService에 dashboardService 의존성이 생겼지만, 로직은 분리되었다.
![image](Pasted-image-20240305182748.png)

먼저 개발 요구 사항을 다시 리스트업했다.

1. 질문별로 대시보드 컴포넌트가 존재한다.
2. 대시보드에 나타내지는 데이터는 컴포넌트마다 같은 것도 있지만 상이한 것도 있다.

그리고 클래스의 용도를 다시 정리해보았다.

- `Entity` Dashboard - 유저 통계량을 저장하는 Entity
  - Statistics : 대시보드에 들어갈 데이터를 담고 있는 클래스, questionId로 구분된 Statistic을 Map으로 가지고 있다.
  - Statistic : _abstract class_, 문항마다 하나씩 가지고 있다. 비율 계산과 평균 계산으로 모두 깔끔하게 나누어질 거라고 판단해서, 구현체를 2개 만들었다.
    - (상속) AverageStatistic : 요구 사항 2번에 의해서 만들어진 구현 클래스
    - (상속) RatioStatistic : 요구 사항 2번에 의해서 만들어진 구현 클래스
- DashboardComponent : _abstract class_, 대시보드 유형마다 하나씩 생성된다. 대시보드 조회 API의 응답에 사용되는 클래스이다.
  - (상속) BestWorthDashboardComponent
  - (상속) CharacterDashboardComponent
  - (상속) HappyDashboardComponent
  - (상속) MoneyDashboardComponent
  - (상속) SadDashboardComponent

이후 다시 그래프 정리를 해보니 아래처럼 정리가 되었다.
![image](Pasted-image-20240305191811.png)

깔끔하게 2가지 종류로 나뉘어서 DashboardComponent와 Statistic이 1:1 매칭이 될거라고 예상했었지만, CharacterDashboard 때문에 그렇게 되지 않았다.
CharacterDashboard 안에 여러 개의 RatioStatistic들이 들어가 있는 셈이다. 이 부분이 변경되면서 DashboardComponent가 기존에 공통으로 questionId를 가지고 있었지만, CharacterDashboard의 데이터 구성이 달라 제외되고 지금은 calculate 추상 메소드 외에는 의미없는 껍데기 클래스가 되어 버렸다.

일단 DashboardComponent를 생성할 때 questionName으로 문항을 검색할 필요 없어서 이것을 제외했다. 이것으로 대쉬보드 조회 1번 당 14번씩(문항 개수) 발생하던 question 조회 쿼리 제거되었다.
그리고 이것으로 인해 DashboardComponent 구현체들이 의존하던 Statistis 의존성이 제거되었다.

### DashboardComponent의 유형 재정의

프론트에서 대시보드의 유형을 알아야만 대시보드를 그릴 수 있기 때문에 DashboardType을 없애지는 못한다.
이를 'QuestionName으로 대체할 수 있지 않을까?' 잠깐 생각했지만, Character 처럼 여러 질문이 모여서 하나의 대시보드를 이루는 타입이 있어 적절하지 않았다.

그래서 대시보드 컴포넌트의 유형을 다시 나누기로 했다.

지금은 대시보드타입"마다" 클래스를 하나씩 가지고 있다. 간단히 보자면 이런 형태였는데,
![image](Pasted-image-20240307033500.png)

여기서 BestWorth, Happy, Sad 는 클래스 이름으로만 나누어져 있고 구성 내용 및 로직은 완전히 동일하다.
즉, 이름만 다른 같은 클래스이다.
(개발할 당시에 너무 복잡한데 데드라인 때문에 어쩔 수 없이 하나씩 생성하였었다.)

그래서 이를 3가지로 나누는것으로 계획했다.
![image](Pasted-image-20240306183343.png)

- BinaryDashboard
  - Character
- RatioDashboard
  - BestWorth
  - Happy
  - Sad
- AverageDashboard
  - Money

### Statistic과 Dashboard 유형 재정의

리팩토링에 앞서 테스트코드를 작성했다.
테스트코드를 작성하다보니 위 3가지로 나누어지는 것은 더 명확해졌으나, 용어가 불분명하고 enum Type들의 용도를 내가 잘 이해하지 못해 다시 정리하였다.

- StatisticsType -> StatisticsCalculationType
  1.  "통계 유형"을 뜻하는 타입이었고, 계속 언급하고 있는 Ratio와 Average 이렇게 2개의 타입이 있다.
  2.  이 타입은 `Statistic` 객체를 생성하는데에 "구분"하는 용도로 사용되었다.
  3.  "구분"은 통계를 산출하는 "방법"에 관한 기준이다.
  4.  그래서 Statistics**Calculation**Type으로 변경하였다.
- DashboardType -> 유지

  프론트에서 렌더링을 구분하기 위한 타입이다. 꼭 필요하고, 수정할 수 없다.

- DashboardStatisticType -> 새로 생성
  Statistic을 Dashboard로 변환할 때 어떤 유형인지 구분하느 타입이다.
  `RATIO`, `AVERAGE`, `BINRAY` 가 존재한다. `StatisticsCalculationType`과 거의 유사하여 합칠까 고민하였지만, 용도가 달라 따로 두었다.
- AnalysisType -> 새로 생성
  대시보드는 사용자가 받은 답변들로만 구성된 통계와 사용자 전체에서 판단하는 통계로 나누어진다. 이 둘을 구분하는 타입이다. 이것이 리팩토링을 하는데에 핵심이 되는 것이었다. 이를 나누지 않고 한 번에 처리하려고 해서 계속해서 복잡해진 셈이다.

### DashboardFactory로 Dashboard 한 번에 관리하기

위에서 언급한 Binary, Ratio, Average 이렇게 3가지 유형에 따라서 DashboardComponent 구현체를 재정의하고, `DashboardFactory`를 통해 생성할 수 있도록 하였다.
그리고 DashboardComponent 생성을 Service가 아닌 Dashboard Entity가 하도록 했다.

이렇게 함으로써 `DashboardService`가 `DashboardComponent` 구현체에 직접 의존하던, 하드코딩되어 있던 코드를 삭제할 수 있었다.

Before

```java
List<DashboardComponent> dashboardComponents = List.of(
		new BestWorthDashboardComponent(statistics, getQuestionIdByQuestionNAme(questions, QuestionName.CORE_VALUE)),
		new HappyDashboardComponent(statistics, getQuestionIdByQuestionNAme(questions, QuestionName.HAPPY_BEHAVIOR)),
		new SadDashboardComponent(statistics, getQuestionIdByQuestionNAme(questions, QuestionName.SAD_ANGRY_BEHAVIOR)),
		new CharacterDashboardComponent(statistics),
		getMoneyDashboardComponent(statistics, period, relation, getQuestionIdByQuestionNAme(questions, QuestionName.BORROWING_LIMIT))
);
```

After

```java
List<DashboardComponent> userDashboards = dashboard.getUserDashboards();
```

```java
public List<DashboardComponent> getUserDashboards() {
	var dashboardTypeListMap = statistics.mapStatisticsByDashboardType();

	return dashboardTypeListMap.entrySet().stream()
			.filter(entry -> entry.getKey().getAnalysisType().isUser())
			.map(entry -> DashboardFactory.create(entry.getKey(), entry.getValue()))
			.toList();
}
```

### 하드코딩 아닌 척 하던 구현체 변경

전체 통계량을 관리하는 대시보드가 딱 하나 있다. "지인이 나에게 빌려줄 수 있는 돈" 인데, 전체 사용자의 평균을 가지고 있어야 했다.

기존에 population과 user를 나누지 않아 하드코딩했었던 `BorrowingLimitEntireStatistic`을 평균을 계산하는 `AverageEntireStatistic` 로 변경했다.

빌려야 하는 돈 Statistic을 생성하는 것으로 가득했던 코드는 평균을 계산하는 코드로 모두 변경되었다.
이로써 StatisticsService의 구현체 의존성도 끊어졌다.

## 리팩토링으로 얻은 것

리팩토링 후의 의존성 그래프는 확실히 간단해졌다.
![image](Pasted-image-20240307035403.png)

귀속되는 클래스끼리 묶은 컴팩트 버전은 더 간단하다.
![image](Pasted-image-20240307035319.png)

이미 존재하는 DashboareStatisticsType으로 새로운 대시보드 타입이 하나가 추가되면

- DashboardType에 타입 추가
- DashboardComponent 구현체 추가
- DashboardService에 해당 DashboardType으로 직접 찾아 그에 맞는 DashboardComponent 추가
  처럼 코드 변경 사항이 많았는데,

변경된 후로는 DashboardType에 타입 추가만 해주면 된다.

PopulationStatistic도 비슷하다.
이미 존재하는 StatisticCalculationType으로 새로운 전체통계가 추가되면

- EntireStatstic 구현체 추가
- StatisticService에 해당 QuestionName으로 직접 찾아 그에 맞는 PopulationStatistic 추가
  이렇게 해주어야 했는데,

변경된 후로는 역시 DashboardType에 타입 추가만 해주면 된다.

변경되는 파일은 `DashboardType.java` 하나이게 된 점이 이 리팩토링을 통해 얻은 가장 큰 소득이 아닐까 싶다.

---

우아한 객체지향 세미나를 보고 적용해본 것인데, 그래프를 그려보니 눈에 확 들어와서 체감하기 좋았다.
이렇게 꼬인 것들을 풀어내고 각자의 역할에 충실한 코드와 아키텍쳐를 유지하려고 노력하하는 것이, 나중에 크기가 커졌을 때 레포를 분리하고 MSA를 적용하기 위한 준비라는 생각이 든다.

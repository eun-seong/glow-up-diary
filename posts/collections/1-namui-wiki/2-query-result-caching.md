---
date: 2024-03-08
title: 불필요한 쿼리 없애기
---

## 불필요한 조회가 가장 많이 일어나는 부분은?

불필요한 조회가 가장 많이 일어나는 부분은으로 예측할 수 있는 곳은 Question과 Option이다.

- 문항 조회
- 설문 생성
- 설문 조회
- 질문 별 답변 조회

남의위키의 핵심적인 모든 api에서 Question과 Option이 사용된다.

그래서 실제로 얼마나 조회가 되는지 알아보았다.

## 실제 쿼리 실행 횟수 확인하기

실제 상황에서 발생하는 API 호출 수를 먼저 확인해보자.
1명의 유저가 각기 다른 N명의 사람에게 자신의 위키를 공유했다고 했고, 그 N명의 사람은 딱 한 번씩만 남의위키 주인에게 위키를 작성해줬다고 가정하자.
문항의 개수는 총 Q개, 선지의 개수는 총 O개 있다.

실제 쿼리 로그 이미지는 최신순으로 정렬되어 있다. (아래에서 위로 읽어야 시간의 흐름과 일치)

### 문항 조회

문항 조회 api 호출했을 때 실제 쿼리이다.

![image](Pasted-image-20240308184012.png)

발생한 쿼리는 아래와 같다.

- 1번의 Question `find`
- Q번의 Option `find` -> (Worst case) Q\*O 번의 Option Document 접근

### 설문 생성

Q개의 질문에 답하는 설문을 1개 생성했을 때의 실제 쿼리이다.

![image](Pasted-image-20240308184538.png)

빨간 부분은 답변 타입이 OPTION인 경우, 민트 부분은 답변 타입이 MANUAL인 경우의 **question 단일 조회 쿼리**이다.

답변 타입이 OPTION인 경우는 요청으로 들어온 답변이 해당 문항의 선지가 맞는지 확인해야 하기 때문에

1. option이 존재하는지
2. question이 가지고 있는 옵션들 중에서 답변과 일치하는 옵션이 있는지
   확인하는 쿼리가 추가적으로 따라온다.

답변 타입이 MANUAL인 경우 옵션을 찾을 필요가 없기 때문에 question 단일 조회만 발생한다.

발생한 쿼리는 아래와 같다.

- Q번의 Question `find`
- (Worst case) Q번의 Option `find`
- (Worst case) Q번의 Option `aggregate`

### 설문 단일 조회

설문 1개를 조회했을 때 발생하는 실제 쿼리 로그이다.

![image](Pasted-image-20240308190305.png)

survey 안에 응답한 문항이 들어 있어서 각 문항을 조회한다.
그리고 설문 생성과 마찬가지로 응답 타입이 OPTION일 경우 해당 옵션의 값을 가져와야 하기 때문에 Option의 조회도 함께 발생하고 있다.

발생한 쿼리는 아래와 같다.

- Q번의 Question `find`
- (Worst case) Q번의 Option `find`

### 질문별 답변 조회

1개의 질문에 대해 답변을 조회했을 때 발생하는 실제 쿼리 로그이다.
테스트 환경에서는 내가 받은 설문이 총 3개 있었다.

![image](Pasted-image-20240308190853.png)

projection을 사용하지 않았기 때문에 내가 받은 여러 survey를 조회한 후, survey 안에 있는 answer들에 대해서 특정 질문의 답변을 뽑아내는 작업을 한다.

빨간색 부분은 이 특정 질문을 찾을 때까지 question을 조회하는 작업이다.
java stream의 filter와 findAny 조합이었기 때문에 요청으로 온 questionId와 일치하는 문항을 찾을 때까지 조회하는 것을 볼 수 있었다. 설문이 총 3개라서 똑같은 쿼리 세트가 3번 반복된다.
응답 타입이 OPTION인 것이 1개 이상일 경우에는 중간에 option 값을 가지고 오기 위해 Option을 한 번 조회한다. MANUAL일 경우는 Option은 조회하지 않는다.

발생한 쿼리는 아래와 같다.

- (Worst case) Q번의 Question `find` 를 총 N번 반복
- 1번 혹은 0번의 Option `find`

## 결과: 쿼리가 발생한 총 횟수는?

N명의 사람이 설문을 작성해줄 때
최악의 경우 총 Q+1 번의 Question `find`, 총 3Q 번의 Option `find` 가 발생한다.

N명이 작성해준 설문을 조회할 때
최악의 경우 총 (N+2)\*Q 번의 Question `find`, 총 Q번의 Option `find`가 발생한다.

현재는 Question과 Option의 양이 굉장히 작고, 수정/삭제/삽입 될 일이 없다. 추후에 사용자가 직접 자신의 설문의 문항과 선지를 커스텀하는 기능이 기획된다면 얘기가 달라지겠지만, 현재는 이 모든 DB에서 발생하는 쿼리가 한 번만 발생해도 충분하다.

## Question 데이터를 캐싱하여 개선하기

### Bean으로 직접 만들기

Spring이 실행될 때 Question과 Option을 조회해서 Map에 담아 놓고 이 인스턴스를 Bean으로 만들어 놓으면, 서버가 실행될 때 한 번만 Question과 Option 전체 조회를 하고 그 이후론 안해도 된다.
대신 Answer에 Question이 참조 형태로 들어가 있어서 questionId 필드를 추가하는 작업이 선행되어야 한다.

![image](Pasted-image-20240309215142.png)

그렇게 Bean을 만들고 이 객체를 repository 대신 주입하여 조회하는 코드로 수정 후, 다시 쿼리 횟수를 확인해보았고 실제 쿼리 발생하지 않는 것을 확인할 수 있었다.

하지만 이렇게 직접 빈으로 등록하는게 최선의 방법이었는지는 잘 모르겠다.
사용자 커스텀 기능이 아니더라도, 남의위키의 문항이 추가될 수 있는 거고 그럼 캐시에 있는 데이터는 오래된 데이터가 된다.
캐시 전략에 대해서 내가 직접 모두 코드를 작성해야 한다는 생각에 머리가 좀 아프다.

### @Cachable 사용하기

그래서 Spring에서 제공해주는 캐시 관련 추상화된 기능들을 사용해보았다.
우리는 캐시 관리 구현체를 따로 사용하지 않을 거라서, `SimpleCacheManager`를 사용하였다.
![image](Pasted-image-20240312192550.png)

코드는 더 간단해졌고, 나중에 `updateQuestion()`이라던가 `saveQuestion()` 등 변경이 발생할 법한 메소드에 캐시 무효화하는 전략을 넣어놓을 수 있어서 좋다.
그리고 redis 같은 걸 추가하게 된다면 cacheManager만 변경해주면 되어서 코드 변경도 많이 발생하지 않는다.

### 결과

문항 전체 조회와 각 문항 1개씩 조회가 최초 한 번씩 발생한 이후에는,
당연하게도 아래 모든 api 호출에서 question과 option 조회 쿼리는 모두 발생하지 않는다.

**문항 조회**
발생되는 쿼리는 없다.

**설문 생성**
![image](Pasted-image-20240309012237.png)

**설문 단일 조회**
![image](Pasted-image-20240309012332.png)

**질문별 답변 조회**
![image](Pasted-image-20240309012407.png)

## 고려할 사항

캐싱을 도입하면 발생하는 일반적인 문제점들을 모두 고려해볼 수 있다.
지금은 문항이 몇 개 없어서 모두 발생하지 않을 문제이지만 염두에 두고 조치를 취해야 할 것 같다.

1. 데이터 불일치
   캐싱된 데이터와 실제 데이터가 다르다. pod가 여러 개 있으니 각 프로세스마다 데이터가 다를 수 있다.
2. 메모리 사용량 증가
   캐시는 메모리에 데이터를 저장하므로 서버의 메모리 부족 문제를 초래할 수 있다.
3. 캐시 무효화 오버헤드
   캐시를 무효화하고 실제 데이터를 가져오기 위해서는 많은 리소스가 사용될 수 있고 오버헤드로 이어질 수 있다.
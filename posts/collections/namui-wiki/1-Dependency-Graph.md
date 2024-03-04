---
date: 2024-03-04
title: 남의위키 의존성 그래프를 그려보기
---

조영호님의 우아한 객체지향 세미나를 듣고, 남의위키의 그래프를 의존성 그래프를 그려보았다.

결과는 대충격🤯

대충 예상은 했지만, 엄청나게 많은 의존성이 엮여 있고 분리가 안되어 있어서 복잡했다.
심지어 User 도메인은 그리지도 않았는데 말이다...

최대한 보기 좋고 예쁜 그래프를 그리려다가 Dashboard 그릴 때부터 포기했다.
![[Pasted image 20240304230450.png]]

파랑 : Repository
빨강 : Service
노랑 : Entity
보라 : Model, Interface, etc...

참조 그래프를 그렸을 때 명확하게 보이는 부분이 몇 가지 있었다.(빨간 박스로 표시)

1. SurveyAnswer 객체는 제거하고, Survey로 통합해야 한다.
2. Statistic과 Statistics는 Dashboard 도메인에서만 사용되는데, Statistic 도메인에 속해있다.
	- Statistic은 남의위키의 전체 통계이고 Dashboard는 사용자의 통계 인데, 이전에 PopulationStatistic 추가되면서 용어가 변경되지 않았다.
3. Survey에서 Statistic을 생성하고 대시보드를 업데이트하는 것은 이벤트 기반을 통해 느슨한 결합으로 변경할 수 있을 것 같다.
4. Question은 어떤 도메인이든 직접 혹은 간접적으로 사용되는데, 여기저기서 사용하지 않게끔 변경할 수 있을까?


눈이 보이는 몇 가지가 있긴 하지만 어떤 객체에서 어떤 행위를 하는지 이 그래프만 보고서는 알수가 없어서 더 자세한 그래프가 필요하다.




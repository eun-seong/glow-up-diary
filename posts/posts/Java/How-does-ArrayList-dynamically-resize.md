---
date: 2024-01-05
title: "[Java] ArrayList는 어떻게 동적으로 크기를 변경할까?"
---


ArrayList는 연속적인 메모리를 사용한다는 문장을 보고,

> ArrayList는 크기가 동적으로 변하는 Vector인데 어떻게 연속적인 메모리를 가질 수 있지?

라는 의문이 들어 내부 코드를 읽어봤습니다.


먼저 ArrayList를 선언하고, 요소를 추가하는 코드를 작성하였습니다.

```java
List<Integer> list = new ArrayList<>();
list.add(1);
```


  
# 생성자: 초기화 시점에 메모리를 얼만큼 할당 받을까?

`ArrayList` 객체를 생성할 때 `ArrayList`는 메모리를 미리 할당하여 가지고 있을까요?
`ArrayList` 생성자 코드를 살펴봅니다.
![[Pasted image 20240105184719.png]]

설명은 초기 capacity가 10인 빈 배열로 구성된다고 작성되어 있습니다. 그리고 `elementData` 라는 멤버필드에 상수 객체로 초기화하고 있습니다. 이 상수가 아마 빈 배열이겠네요.

`elementData`를 살펴볼게요.
![[Pasted image 20240105184847.png]]
설명을 보면, `elementData`는 `ArrayList`의 버퍼 배열이라고 합니다. 
실제로 타입은 `Object[]`로 모든 객체를 담을 수 있는 순수 배열이네요. `ArrayList` 내부에서는 이 `elementData` 순수 배열을 통해서 원소를 담고 있습니다. 그리고 `ArrayList`의 capacity는 이 배열의 크기로 정해집니다. 

그럼 `DEFAULTCAPACITY_EMPTY_ELEMENTDATA`의 타입도 당연히 `Object[]`이겠네요.
![[Pasted image 20240105185225.png]]

예상대로 타입이 `elementData`와 동일합니다. 이 객체는 빈 배열의 공유 인스턴스입니다.

결론 : `ArrayList`를 생성하면, 이 인스턴스는 빈 배열로 초기화됩니다. 즉, 메모리를 가지고 있지 않습니다.



# 삽입: 어느 시점에 메모리가 확장될까?

그럼 리스트가 어느정도로 차야 확장이 되고, 얼만큼 확장될까요?

`add(1)` 메소드 내부 코드를 보겠습니다.
![[Pasted image 20240105190028.png]]

`add(1)`을 호출하면 위 메소드가 호출될 겁니다.
이 메소드 내부에서 `private add()`메소드를 호출하고 있네요. 파라미터로는 추가할 데이터, `elementData`와 `size`를 넘기고 있습니다.
`size`는 `ArrayList` 인스턴스의 크기입니다. `list.size()`를 호출하면 반환받는 숫자이죠.

그럼 내부 `add` 메소드를 봅시다.
![[Pasted image 20240105190231.png]]

전달받은 크기 `size`가 `elementData`의 크기와 같을 경우에 `grow()`를 호출하고 있어요.
`grow()` 는 아마 메모리를 확장하는 메소드이겠죠.

현재 인스턴스 크기인 `size`와 capacity(내부 버퍼 `elementData`의 크기)가 같을 때.
즉, capacity 만큼 배열이 꽉 찼을 때 메모리를 확장한다는 것을 알 수 있습니다.

결론 : 내부 capacity만큼 꽉 찼을 때 확장한다.

# 첫 메모리 할당

초기화가 막 된 지금 상태에서는 `size`도 0, `elementData.length`도 당연히 0 이겠죠.
`add` 메소드가 한 번이라도 호출될 경우 실제 원소를 담을 수 있는 메모리가 할당될 것입니다.

`grow()` 메소드 내부 코드를 봅니다.
![[Pasted image 20240105191207.png]]

정수를 파라미터로 받는 메소드가 하나 더 있네요.
![[Pasted image 20240105191250.png]]

파라미터로 원하는 최소 capacity를 받고 있어요.
원소를 하나만 추가하는 메소드이니  `size + 1`를 전달 받았습니다.

`oldCapacity`는 현재 0입니다. 그래서 `else` 구문이 실행되겠네요.
여기서 드디어 메모리가 할당됩니다. 
`DEFAULT_CAPACITY`는 값이 10인 상수이므로, `elementData`는 크기가 10인 Object 배열로 재할당됩니다. 이제 capacity는 10으로 증가되었습니다.

# 메모리 확장

그럼 원소 11개를 넣는 시점에서 메모리 확장이 발생하겠네요. 메모리 확장은 얼만큼 될까요?

`grow()` 메소드에서 `if` 문에 해당하는 내용입니다.
![[Pasted image 20240105191250.png]]
`add(1)`을 11번째 호출했다면, `oldCapacity`가 현재 10일 것입니다.

이 때 확장할 배열의 길이를 계산하고, 이 길이만큼의 새로운 배열을 만들어 기존 배열을 복사합니다.
`ArraySupport.newLength()` 메소드의 파라미터를 살펴볼게요.
1. `oldLength` : 현재 배열의 크기
2. `minGrowth` : 확장해야 할 최소 크기
3. `prefGrowth` : 선호하는 확장할 크기

중요한 점은 `prefGrowth`입니다. `oldCapacity`의 절반을 요구하고 있습니다.
현재는 요구할 크기가 10의 절반인 5 이므로, `list`의 capacity는 15가 될 것입니다.
그럼 그 다음 요구 크기는 7이 될 것이고, capacity는 22가 되겠죠.

결론 : 메모리 확장 시, 현재 capacity의 1.5배 만큼 확장된다.


# 결론
`ArrayList`의 메모리 할당 및 확장은 아래 순서로 이루어집니다.
1. `new ArrayList<>()`로 초기화 시, 메모리 할당받지 않는다.
2. 첫 원소를 추가할 때, 내부 버퍼에 크기가 10인 배열을 할당받는다.
3. 버퍼가 꽉 찰 경우, 현재 버퍼 크기의 1.5배인 배열을 새로 할당 받는다.


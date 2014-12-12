﻿## Backbone модель дерева слоёв

Инициализируется из исходного описания карты ГеоМиксера:
```javascript
var tree = new LayersTreeNode({content: rawMapInfo.Result});
```

Вторым параметром дерева слоёв можно указывать непосредственного родителя этой ноды.

`id` модели соответствует имени слоя или группы в описании карты.

#### Атрибуты ноды дерева
  * `parent` - родительская нода
  * `visible` - признак видимости ноды
  * `list` - можно ли включать потомков по одному (true) или в произвольном количестве (false)
  * `childrenNodes` - Backbone коллекция дочерних узлов
  * `properties` - исходные свойства узла из описания карты
  * `expanded` - признак развёрнутости группы
  * `depth` - глубина ноды в дереве (0 - корень)
  
#### Методы
  * `find(id)` - возвращает ноду из поддерева с заданным `id`
  * `saveState`, `loadState(state)` - сохранение и загрузка состояния видимости и развёрнутости. Состояние видимости нелистовых нод однозначно устанавливается по состоянию листовых.
  * `eachNode(visitor, onlyLeaves)` - итерирование по всем нодам дерева.
  `visitor` - ф-ция, которая будет вызвана для каждой ноды (нода - первый параметр). `onlyLeaves = true` - итерировать только по листовым нодам
  
  
#### Формат данных при сериализации
Хеш со следующими объектами для каждой ноды (id ноды - ключ хеша):
  * `visible` - признак видимости ноды (только для листовых нод)
  * `expanded` - признак развёрнутости ноды (только для нелистовых нод)
  
Дополнительные события:
  * `childChange` - произошли изменения в одном из потомков данной ноды. Первый аргумент - изменившаяся нода.
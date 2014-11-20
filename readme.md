Backbone модель дерева слоёв.

Инициализируется из исходного описания карты ГеоМиксера:
```javascript
var tree = new LayersTreeNode();
tree.init({content: rawMapInfo.Result});
```

Атрибуты ноды дерева:
  * `visible` - признак видимости ноды
  * `list` - можно ли включать потомков по одному (true) или в произвольном количестве (false)
  * `childrenNodes` - Backbone коллекция дочерних узлов
  * `properties` - исходные свойства узла из описания карты
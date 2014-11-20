var LayersTreeNode = Thorax.Model.extend({
    init: function(rawTreeNode, parent) {
        var props = rawTreeNode.content.properties,
            rawChildren = rawTreeNode.content.children;
        
        if (rawChildren && rawChildren.length) {
            var children = new LayersTreeChildren(
                _.map(rawChildren, function(child) {
                    return (new LayersTreeNode()).init(child, this);
                }, this)
            );
            this.set('childrenNodes', children, {silent: true});
        }
        
        this._parent = parent;
        
        this.set({
            visible: !!props.visible,
            list: !!props.list,
            properties: props
        });
        
        this.on('change:list', function(){this.updateNodeVisibility();}, this);
        
        return this;
    },
    
    _setSubtreeVisibility: function(isVisible) {
        var attrs = this.attributes;
        if (attrs.visible != isVisible) {
            this.set('visible', isVisible);
            
            if (attrs.childrenNodes) {
                for (var c = 0; c < attrs.childrenNodes.length; c++) {
                    var vis = isVisible && (!attrs.list || c == 0); //когда делаем видимой группу-список, виден только первый элемент группы
                    attrs.childrenNodes.at(c)._setSubtreeVisibility(vis);
                }
            }
        }
    },
    
    setNodeVisibility: function(isVisible) {        
        //устанавливаем видимость поддерева, которое начинается с этого элемента
        this._setSubtreeVisibility(isVisible);
        
        //идём вверх по дереву до корня и меняем видимость родителей
        var parentElem = this._parent;
        parentElem && parentElem.updateNodeVisibility(this); 
    },
    
    
    updateNodeVisibility: function(triggerSubnode) {
        var attrs = this.attributes,
            isList = attrs.list,
            children = attrs.childrenNodes,
            triggerNodeVisible = triggerSubnode ? triggerSubnode.get('visible') : false,
            visibleNode = triggerNodeVisible ? triggerSubnode : null;
        
        var isVisible = false;
        
        if (children) {
            for (var c = 0; c < children.length; c++) {
                var child = children.at(c);
                var childVisible = child.get('visible');
                isVisible = isVisible || childVisible;
                
                if (childVisible && !visibleNode) {
                    visibleNode = child;
                }
                
                if (isList && childVisible && child !== visibleNode) {
                    child._setSubtreeVisibility(false);
                }
            }
        }

        if (isVisible !== attrs.visible) {
            this.set('visible', isVisible);
            
            var parent = this._parent;
            parent && parent.updateNodeVisibility(this);
        }
    }
})

var LayersTreeChildren = Thorax.Collection.extend({model: LayersTreeNode});
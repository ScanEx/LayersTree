var LayersTreeNode = Thorax.Model.extend({
    constructor: function(rawTreeNode, parent) {
        Backbone.Model.apply(this);
        
        var props = rawTreeNode.content.properties,
            rawChildren = rawTreeNode.content.children;
            
        this.id = props.GroupID || props.name;
        
        this.set({
            parent: parent,
            visible: !!props.visible,
            list: !!props.list,
            properties: props,
            depth: parent ? parent.get('depth') + 1 : 0,
            expanded: !!props.expanded
        });

        if (rawChildren && rawChildren.length) {
            var children = new LayersTreeChildren(
                _.map(rawChildren, function(child) {
                    var node = new LayersTreeNode(child, this);
                    node.on({
                        change: function() {
                            this.trigger('childChange', node);
                        }, 
                        childChange: function(targetNode) {
                            this.trigger('childChange', targetNode);
                        }
                    }, this);
                    return node;
                }, this)
            );
            this.set('childrenNodes', children, {silent: true});
        }

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
        var parent = this.attributes.parent;
        parent && parent.updateNodeVisibility(this);
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
            
            var parent = this.attributes.parent;
            parent && parent.updateNodeVisibility(this);
        }
    },
    find: function(id) {
        if (this.id == id) {
            return this;
        }
        var children = this.attributes.childrenNodes;
        return children && children.reduce(function(memo, node) {
            return memo || node.find(id);
        }, null);
    },
    _saveState: function(state) {
        var attrs = this.attributes;
        if (attrs.childrenNodes) {
            state[this.id] = {
                expanded: attrs.expanded
            }
            attrs.childrenNodes.each(function(node) {
                node._saveState(state);
            })
        } else {
            state[this.id] = {
                visible: attrs.visible
            }
        }
        return state;
    },
    saveState: function() {return this._saveState({})},
    loadState: function(state) {
        var nodeState = state[this.id],
            children = this.attributes.childrenNodes;
            
        if (children) {
            if (nodeState && 'expanded' in nodeState) {
                this.set('expanded', nodeState.expanded);
            }
            children.each(function(node) {
                node.loadState(state);
            })
        } else {
            if (nodeState && 'visible' in nodeState) {
                this.setNodeVisibility(nodeState.visible);
            }
        }
    }
})

var LayersTreeChildren = Thorax.Collection.extend({model: LayersTreeNode});
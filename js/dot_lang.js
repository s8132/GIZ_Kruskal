/* Init view */
$('#dotError').hide();
$('#startBtn').hide();
$('#error').hide();
$('#success').hide();
$('#resetButtons').hide();

$("#restartWithDataBtnAuto").click(function(event){
    event.preventDefault();
    restartWithValue($('#source').val());
});

/* Draw graph */
$('#drawDot').click(function(event){
    event.preventDefault();

    graphVisual.draw($('#source').val(), "graphView", function(network){
        initNetwork(network);
        $('#dotError').hide();
        $('#tabs').find('a[href="#auto"]').tab('show');
    }, function(err){
        printErrorDotParse(err);
    });
});

function initNetwork(network) {
    $('#startBtn').show().click(function (event) {
        event.preventDefault();
        var nodes = objectToArray(network.nodesData._data),
            edges = objectToArray(network.edgesData._data),
            result = algorithm(nodes, edges);

        printResult(nodes, edges, result);

        $(this).hide();
    });

}

function algorithm(nodes, edges) {

    var queue = [],
        mySet = new MySet(),
        result = [];

    nodes.forEach(function(node){
        mySet.add(node.id);
    });

    edges.forEach(function(edge){
        queue.push(edge);
    });
    queue.sort(compare);

    queue.forEach(function(edge){
        var nodeTo = edge.to,
           nodeForm = edge.from;

        if(mySet.find(nodeTo)!=mySet.find(nodeForm)){
            mySet.union(nodeTo, nodeForm);
            result.push(edge);
        }
    });

    return result;
}

/* Funkcje pomocniczne */
var MySet = function(){
    var _set = [];
    return{
        add: function(obj){
            _set.push({values: [obj]});
        },
        union: function(a,b){
            var aIndex = this.find(a),
                bIndex = this.find(b);
            var bVal = _set[bIndex].values;
            _set[aIndex].values = _set[aIndex].values.concat(bVal);
            _set.splice(bIndex, 1);
        },
        find: function(value){
            return _.indexOf(_set, _.find(_set, function(obj){
                var result = false;
                obj.values.forEach(function(val){
                    if(val===value){
                        result = true;
                    }
                });
                return result
            }));
        },
        _get: function(){
            return _set;
        }
    }
};

function compare(a,b){
    if(a.label < b.label){
        return -1;
    }
    if(a.label > b.label){
        return 1;
    }
    return 0;
}

function objectToArray(obj){
    var keys = Object.keys(obj),
        tab = [];
    keys.forEach(function(key){
        tab.push(obj[key]);
    });
    return tab;
}

function printResult(nodes, edges, result){

    var sumWeight = 0;

    result.forEach(function(edge){
        var e = _.findWhere(edges, {id: edge.id});
        $('#success').find('table > tbody > tr.edge').append('<td style="text-align: center;">' + edge.from + ' - ' + edge.to + '</td>');
        $('#success').find('table > tbody > tr.weight').append('<td style="text-align: center;">' + edge.label + '</td>');
        sumWeight += edge.label;
        if(e!=undefined){
            e.color = "red";
        }
    });

    $('#success').show();
    $('.selectedNode').html('<strong>' + sumWeight + '</strong>');

    graphVisual.redraw(nodes, edges, "graphView");


    $('#drawDot').hide();
    $('#resetButtons').show();
}

function printErrorDotParse(err){
    var match = /\(char (.*)\)/.exec(err);
    if (match) {
        var pos = Number(match[1]),
            txtData = $('#source').get(0);
        if(txtData.setSelectionRange) {
            txtData.focus();
            txtData.setSelectionRange(pos, pos);
        }
    }
    $('#dotError').show().text(err.toString());
}

var graphVisual = (function(){
    var network = null;
    return {
        destroy: function(){
            if(network!==null){
                network.destroy();
                network = null;
            }
        },
        draw: function(dotData, sourceElementId, successCallback, errorCallback){
            this.destroy();
            try{
                var data = {dot: dotData},
                    container = document.getElementById(sourceElementId),
                    options = {height: '400px', configurePhysics:true};
                network = new vis.Network(container, data, options);
                successCallback(network);
            }catch(err){
                errorCallback(err);
            }
        },
        redraw: function(nodes, edges, sourceElementId){
            this.destroy();
            var data = {
                    nodes: nodes,
                    edges: edges
                },
                container = document.getElementById(sourceElementId),
                options = {height: '400px', configurePhysics:true};

            network = new vis.Network(container, data, options);
        }
    }
})();
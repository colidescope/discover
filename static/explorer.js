

var chartDiv = document.getElementById("chart");

// Variables
var svgWidth  = chartDiv.clientWidth,
    svgHeight = 700,
    margin = {"top": 10, "right": 15, "bottom": 25, "left": 50},
    width  = svgWidth - margin.left - margin.right,       
    height = svgHeight - margin.top  - margin.bottom;

// SVG Viewport
var svgViewport = d3.select(".col-chart")
    .append("svg")
    .attr("id", "scatter")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

// Scales
var xAxisScale = d3.scale.linear()
    .range([0, width]).nice();

var yAxisScale = d3.scale.linear()
    .range([height, 0]).nice();

var radiusScale = d3.scale.linear()
    .range([4, 12]);

var colorScale = d3.scale.linear()
    .range([240, 0]);

var baseSize = 5;

var selected = [];
var boolIsolateSelected = false;
var boolIsolateOptimal = false;

//TOOLTIP
var tooltip = d3.select(".tooltip");
var tooltip_title = tooltip.append("p").attr("id", "tooltip_title");

var xCat = null;
var yCat = null;
var rCat = null;
var colorCat = null;

targetWidth = 200;


function groupBy(arr, property) {
  return arr.reduce(function(memo, x) {
    if (!memo[x[property]]) { memo[x[property]] = []; }
    memo[x[property]].push(x);
    return memo;
  }, {});
}

// convert series as binary to continuous equivalent for visualization
function processBinary(str, header) {
    seq = JSON.parse(str);
    value = 0

    sub = header.substring(4);
    depth = Number(sub.substring(0, sub.indexOf(']')));
    
    for (var i = 0; i < seq.length; i++) {
        value += seq[i] * Math.pow(depth, i);
    }

    return value;
}

// convert sequences as permutation to continuous equivalent for visualization
function processPermutation(str, header) {
    
    permutation = JSON.parse(str);

    var n = permutation.length;

    var pos = [];
    var elems = [];

    var k = 0;
    var m = 1;

    for (var i = 0; i < n; i++) {
        pos.push(i);
        elems.push(i);
    }

    for (var i = 0; i < n-1; i++) {
        k += m * pos[permutation[i]];
        m = m * (n-i);
        pos[elems[n-i-1]] = pos[permutation[i]];
        elems[pos[permutation[i]]] = elems[n-i-1];
    }

    return k;
}

var img = new Image();

function loadData() {

    var element = document.querySelector(".inner_space");
    if (element){element.parentNode.removeChild(element);}

    // Get the data
    var jobName = encodeURIComponent(document.getElementById("job-name-entry").value);
    d3.json("/api/v1.0/get_data/"+jobName, function(error, result) {

        console.log(result);

        if (result.status == "fail"){
            alert("WARNING: " + jobName + " not found in data folder!")
        }

        // load example image to get tooltip size, wait until load to run rest of code
        var imgUrl = "/api/v1.0/get_image/" + jobName + '/0';
        img.src = imgUrl;

        img.onload = function () {
            runViz(result, jobName);
        }

        img.onerror = function(){
            runViz(result, jobName);
        }

    });

}


function runViz(result, jobName) {

    imageTooltip = result.load_images

    if (imageTooltip){

        var imgUrl = "/api/v1.0/get_image/" + jobName + '/0';
        var img = new Image();
        // var img = getImage(jobName, 0)
        img.src = imgUrl;

        img_width = targetWidth;
        img_height = img.height / (img.width / targetWidth);

        // console.log(tooltip);
        var tooltip_image = document.getElementById("tooltip-image");
        if (tooltip_image){tooltip_image.remove();}

        var tooltip_image = tooltip.append("svg")
            .attr("width", img_width)
            .attr("height", img_height)
            .attr('id', "tooltip-image")
            .append("svg:image")
            .attr('x',0)
            .attr('y',0)
            .attr('width', img_width)
            .attr('height', img_height);
    }else{
        img_width = targetWidth;
        img_height = 0;
    }

    data = result.data

    // filter incoming data to remove any designs with blank or null values
    data = data.filter(function(d){
        bool = true;
        for (var key in d) {
            if (d[key] == "" || d[key] == null){
                bool = false;
                break;
            }
        }
        return bool;
    });

    var allKeys = Object.keys(data[0]);
    console.log(allKeys);
    

    // check if constraints are being used
    if (allKeys.indexOf("feasible") !== -1){
        dataSplit = groupBy(data, "feasible");
        if (dataSplit.False == undefined){
            dataSplit.False = []
        }
    }else{
        var dataSplit = {
            False: [],
            True: data
        };
    };

    if (dataSplit.True !== undefined){
        var domKeys = allKeys.filter(function(key){ 
            return key.indexOf("[Minimize]") !== -1 || key.indexOf("[Maximize]") !== -1 
        }).concat(["id"]);

        var domData = dataSplit.True.map(function(obj) {
            newObj = {};
            domKeys.map(function(key) {
                newObj[key] = obj[key]
            })
            return newObj;
        });

        dominant = getDominantSet(domData);

        var ids = []
        dominant.map(function(obj) {
            ids.push(obj["id"]);
        });

        data.map(function(obj){
            if (ids.indexOf(obj["id"]) > -1){
                obj["dominant"] = true;
            }else{
                obj["dominant"] = false;
            }
        });
    }else{
        data.map(function(obj){
            obj["dominant"] = false;
        });
        dataSplit.True = [];
    }

    //specify which categories to display in selection
    var headerNames = allKeys.filter(function(key){ return key.indexOf("[Minimize]") !== -1 || key.indexOf("[Maximize]") !== -1 || key == "generation" || key == "id" });

    console.log(headerNames)

    //set default selection
    if (xCat == null){
        xCat = headerNames[headerNames.length-2];
    };
    if (yCat == null){
        yCat = headerNames[headerNames.length-1];
    };
    if (rCat == null){
        rCat = headerNames[0];
    };
    if (colorCat == null){
        colorCat = headerNames[1];
    };

    //create selection sets
    opt_xaxis = d3.select("#list-xaxis").selectAll("p")
        .data(headerNames);

    opt_xaxis
        .enter()
        .append("p")
        .attr("class", "option")
        .on("click", function(d, i) {
            xCat = d;
            update();
        })
        .text(function(d) { return d; });
    opt_xaxis
        .exit().remove()

    opt_yaxis = d3.select("#list-yaxis").selectAll("p")
        .data(headerNames);

    opt_yaxis
        .enter()
        .append("p")
        .attr("class", "option")
        .text(function(d) { return d; })
        .on("click", function(d) {
            yCat = d;
            update();
        });
    opt_yaxis
        .exit().remove()

    opt_radius = d3.select("#list-radius").selectAll("p")
        .data(headerNames);

    opt_radius
        .enter()
        .append("p")
        .attr("class", "option")
        .text(function(d) { return d; })
        .on("click", function(d) {
            rCat = d;
            updateDims();
            updateCircleStyle();
            updateBoxStyle();
        });
    opt_radius
        .exit().remove()

    opt_color = d3.select("#list-color").selectAll("p")
        .data(headerNames);

    opt_color
        .enter()
        .append("p")
        .attr("class", "option")
        .text(function(d) { return d; })
        .on("click", function(d) {
            colorCat = d;
            updateDims();
            updateCircleStyle();
            updateBoxStyle();
        });
    opt_color
        .exit().remove()

    // Axis Functions
    var xAxis = d3.svg.axis()
        .scale(xAxisScale)
        .orient("bottom")
        .tickSize(-height)
        .ticks(5);

    var yAxis = d3.svg.axis()
        .scale(yAxisScale)
        .orient("left")
        .tickSize(-width)
        .ticks(5);

    // Zoom Function
    var zoom = d3.behavior.zoom()
        .x(xAxisScale)
        .y(yAxisScale)
        .scaleExtent([1.0, 15.0])
        .on("zoom", zoomFunctionXY);

    var zoomX = d3.behavior.zoom()
        .x(xAxisScale)
        .scaleExtent([0.2, 30.0])
        .on("zoom", zoomFunctionX);

    var zoomY = d3.behavior.zoom()
        .y(yAxisScale)
        .scaleExtent([0.2, 30.0])
        .on("zoom", zoomFunctionY);

    // Inner Drawing Space
    var innerSpace = svgViewport.append("g")
        .attr("class", "inner_space")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Draw Axis
    innerSpace.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        // .append("text")
        //   .classed("label", true)
        //   .attr("x", width)
        //   .attr("y", margin.bottom - 10)
        //   .style("text-anchor", "end")
        //   .text("x label");

    innerSpace.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
          // .classed("label", true)
          // .attr("transform", "rotate(-90)")
          // .attr("y", -margin.left)
          // .attr("dy", ".71em")
          // .style("text-anchor", "end")
          // .text("y label");

    innerSpace.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "rect-middle")
        .call(zoom)
        .on("dblclick.zoom", null);

    innerSpace.append("rect")
        .attr("width", margin.left)
        .attr("height", height)
        .attr("id", "rect-left")
        .attr("transform", "translate(-" + margin.left + ",0)")
        .call(zoomY)
        .on("dblclick.zoom", null);

    innerSpace.append("rect")
        .attr("width", width)
        .attr("height", margin.bottom)
        .attr("id", "rect-bottom")
        .attr("transform", "translate(0, " + height + ")")
        .call(zoomX)
        .on("dblclick.zoom", null);

    var objects = innerSpace.append("svg")
        .classed("objects", true)
        .attr("width", width)
        .attr("height", height);

     var xLine = objects.append("svg:line")
        .classed("axisLine hAxisLine", true)
        .attr("x1", 0)
        .attr("y1", yAxisScale(0))
        .attr("x2", width)
        .attr("y2", yAxisScale(0));

    var yLine = objects.append("svg:line")
        .classed("axisLine vAxisLine", true)
        .attr("x1", xAxisScale(0))
        .attr("y1", 0)
        .attr("x2", xAxisScale(0))
        .attr("y2", height);

    function updateTooltip(d){
        if (!boolIsolateSelected || selected.indexOf(d["id"]) > -1){

            if (imageTooltip){

                var imgUrl = "/api/v1.0/get_image/" + jobName + '/' + d["id"];
                // var url = "./images/" + d["id"] + ".png";
                tooltip_image.attr("xlink:href", imgUrl);
                offX = img_width + 40 - 280;
                offY = img_height + 80;
            }else{
                offX = 135 - 280;
                offY = 75;
            }

            mouseX = d3.event.pageX;
            mouseY = d3.event.pageY;

            tooltip.style("left", function(){
                if (mouseX < offX){
                    return xAxisScale(d[xCat]) + margin.left + 20 + "px";
                }else{
                    return xAxisScale(d[xCat]) + margin.left + 20 - offX + "px";
                }
                
            });

            tooltip.style("top", function(){
                if (mouseY < offY){
                    return yAxisScale(d[yCat]) + margin.top + 20 + "px";
                }else{
                    return yAxisScale(d[yCat]) + margin.top + 20 - offY + "px";
                }
                
            });

            tooltip_title.text("Design #" + d["id"]);
            tooltip.style("visibility", "visible");
        };
    };

    var box = objects.selectAll("box")
        .data(dataSplit.False);
    box
        .enter().append("rect")
        .classed("box", true)
        .attr("width", baseSize)
        .attr("height", baseSize)
        .on("mouseover", function(d){
            updateTooltip(d);
        })
        .on("mouseout", function(){
            tooltip.style("visibility", "hidden");
        })
        .call(zoom)
        ;
    box.exit().remove()

    var circle = objects.selectAll("dot")
        .data(dataSplit.True);
    circle
        .enter().append("circle")
        .classed("dot", true)
        .attr("r", 2)
        .on("click", function(d) {
            selectDesign(d["id"]);
        })
        .on("mouseover", function(d){
            updateTooltip(d);
        })
        .on("mouseout", function(){
            tooltip.style("visibility", "hidden");
        })
        .call(zoom)
        ;
    circle.exit().remove()

    update();

    function zoomUpdate(){
        // Redraw the Axis
        innerSpace.select(".x.axis").call(xAxis);
        innerSpace.select(".y.axis").call(yAxis);

        xLine.attr("y1", yAxisScale(0)).attr("y2", yAxisScale(0));
        yLine.attr("x1", xAxisScale(0)).attr("x2", xAxisScale(0));

        // Select All Circles
        d3.select("#scatter").selectAll(".dot")
            .attr("cx", function(d, i) { return xAxisScale(d[xCat]); })
            .attr("cy", function(d, i) { return yAxisScale(d[yCat]); })

        // Select All boxes
        d3.select("#scatter").selectAll(".box")
            .attr("x", function(d, i) { return xAxisScale(d[xCat]) - baseSize/2; })
            .attr("y", function(d, i) { return yAxisScale(d[yCat]) - baseSize/2; })
    }

    // Zoom Function Event Listeners
    function zoomFunctionXY() {

        zoomY.y(yAxisScale);   
        // innerSpace.select("rect-bottom").call(zoomY);
        zoomX.x(xAxisScale);   
        // innerSpace.select("rect-left").call(zoomX);

        zoomUpdate();
        
    };
    function zoomFunctionY() {

        zoom.x(xAxisScale).y(yAxisScale);   
        // innerSpace.select("rect-middle").call(zoom);
        zoomX.x(xAxisScale);   
        // innerSpace.select("rect-left").call(zoomX);

        zoomUpdate();
        
    };
    function zoomFunctionX() {

        zoom.x(xAxisScale).y(yAxisScale);   
        // innerSpace.select("rect-middle").call(zoom);
        zoomY.y(yAxisScale);   
        // innerSpace.select("rect-bottom").call(zoomY);

        zoomUpdate();
        
    };

    d3.select("#button-resetZoom").on("click", function() {
        update();
    });
    d3.select("#button-resetRadius").on("click", function() {
        resetDim("radius");
    });
    d3.select("#button-resetColor").on("click", function() {
        resetDim("color");
    });
    d3.select("#button-resetChosen").on("click", function() {
        clearDesigns();
    });
    d3.select("#button-isolateSelected").on("click", function() {
        isolateSelected();
    });
    d3.select("#button-isolateOptimal").on("click", function() {
        isolateOptimal();
    });
    // d3.select("#button-loadData").on("click", function() {
    //     loadData();
    // });

    function resetDim(type){
        if (type == "radius"){
            rCat = null;
        }else if(type == "color"){
            colorCat = null;
        };
        updateDims();
        updateCircleStyle();
        updateBoxStyle();
    };

    function selectDesign(id) {
        indx = selected.indexOf(id);
        if ( indx > -1) {
            selected.splice(indx, 1);
        }else{
            selected.push(id);
        }
        updateSelectedList();
        updateCircleStyle();
    };

    function clearDesigns() {
        selected = [];
        updateSelectedList();
        updateCircleStyle();
    };

    function loadDesign(d) {
        console.log("Attempting to lead design #" + d);
        var request = new XMLHttpRequest();
        request.open('GET', '/api/v1.0/get_design/'+jobName+'/'+d, true)
        request.onload = function (d) {
            var json = JSON.parse(this.response)
            if (json.status == 'no-gh'){
                alert("WARNING: Grasshopper connection not found.");
            }
            if (json.status == 'job-running'){
                alert("WARNING: Wait for job to finish before reinstating designs.");
            }
        }
        request.send();
    }

    function updateSelectedList() {
        var sel = d3.select("#list-chosen").selectAll("div")
            .data(selected);

        sel.exit()
            .remove();

        var newItems = sel.enter().append("div");

        if (imageTooltip){
            newItems
                .append("svg")
                .attr('width', img_width)
                .attr('height', img_height)
                .append("svg:image")
                .attr('x',0)
                .attr('y',0)
                .attr('width', img_width)
                .attr('height', img_height)
            ;

            sel.select("image")
                .attr("xlink:href", function(d){
                    return "/api/v1.0/get_image/" + jobName + '/' + d;
                })
            ;
        }

        newItems
            .append("p")
            .attr("class", "option")
            .on("click", function(d) {
                loadDesign(d);
            })
        ;

        sel.select("p")
            .text(function(d) { return "Design #" + d; })
        ;
    };

    function isolateOptimal() {
        boolIsolateOptimal = !boolIsolateOptimal;
        boolIsolateSelected = false;
        updateCircleStyle();
        updateBoxStyle();
    };

    function isolateSelected() {
        boolIsolateSelected = !boolIsolateSelected;
        boolIsolateOptimal = false;
        updateCircleStyle();
        updateBoxStyle();
    };

    function update() {

        updateDims();

        zoom.x(xAxisScale).y(yAxisScale);
        zoomX.x(xAxisScale);
        zoomY.y(yAxisScale);

        var svg = d3.select("#scatter").transition();
        xLine.transition();
        yLine.transition();

        // Redraw the Axis
        innerSpace.select(".x.axis").transition().call(xAxis);
        innerSpace.select(".y.axis").transition().call(yAxis);

        xLine.attr("y1", yAxisScale(0)).attr("y2", yAxisScale(0));
        yLine.attr("x1", xAxisScale(0)).attr("x2", xAxisScale(0));

        updateCirclePos();
        updateCircleStyle();
        updateBoxPos();
        updateBoxStyle();

    };

    function updateDims(){
        opt_xaxis.style("background-color", function(d){ if(d == xCat){ return "darkgrey"; } });
        opt_yaxis.style("background-color", function(d){ if(d == yCat){ return "darkgrey"; } });
        opt_radius.style("background-color", function(d){ if(d == rCat){ return "darkgrey"; } });
        opt_color.style("background-color", function(d){ if(d == colorCat){ return "darkgrey"; } });

        var xMin = d3.min(data, function(d) { return +d[xCat]; });
        var xMax = d3.max(data, function(d) { return +d[xCat]; });
        var xOff = (xMax - xMin) * .04;

        var yMin = d3.min(data, function(d) { return +d[yCat]; });
        var yMax = d3.max(data, function(d) { return +d[yCat]; });
        var yOff = (yMax - yMin) * .04;

        var rMin = d3.min(data, function(d) { return +d[rCat]; });
        var rMax = d3.max(data, function(d) { return +d[rCat]; });

        var cMin = d3.min(data, function(d) { return +d[colorCat]; });
        var cMax = d3.max(data, function(d) { return +d[colorCat]; });

        xAxisScale.domain([xMin - xOff, xMax + xOff]);
        yAxisScale.domain([yMin - yOff, yMax + yOff]);
        radiusScale.domain([rMin, rMax]);
        colorScale.domain([cMin, cMax]);
    }

    function updateCirclePos(){
      
        // Select All Circles
        d3.select("#scatter").selectAll(".dot")
            .transition()
            .attr("cx", function(d, i) { return xAxisScale(d[xCat]); })
            .attr("cy", function(d, i) { return yAxisScale(d[yCat]); })

    };

    function updateCircleStyle(){

        // Select All Circles
        d3.select("#scatter").selectAll("circle")
            .attr("r", function(d) {
                if (rCat === null){
                    return 4;
                }else{
                    return radiusScale(d[rCat]); 
                }
            })
            .style("fill-opacity", function(d) {
                indx = selected.indexOf(d["id"]);
                if (boolIsolateSelected) {
                    if (indx > -1) {
                        return 0.6;
                    }else{
                        return 0.02;
                    };
                }else if(boolIsolateOptimal){
                    if (d["dominant"] || indx > -1) {
                        return 0.6;
                    }else{
                        return 0.02;
                    };
                }else{
                    return 0.6
                };
            })
            .style("fill", function(d) { 
                if (colorCat === null){
                    return "darkgrey";
                }else{
                    return d3.hsl(colorScale(d[colorCat]), 1.0, 0.475);
                }
            })
            .style("stroke-width", function(d) {
                indx = selected.indexOf(d["id"]);
                if (indx > -1) {
                    return 2;
                }else{
                    return 0;
                };
            });

    };

    function updateBoxPos(){
        // Select All Boxes
        d3.select("#scatter").selectAll(".box")
            .transition()
            .attr("x", function(d, i) { return xAxisScale(d[xCat]) - baseSize/2; })
            .attr("y", function(d, i) { return yAxisScale(d[yCat]) - baseSize/2; })
    };

    function updateBoxStyle(){
        // Select All Boxes
        d3.select("#scatter").selectAll(".box")
            .style("stroke", function(d) { 
                if (colorCat === null){
                    return "darkgrey";
                }else{
                    return d3.hsl(colorScale(d[colorCat]), 1.0, 0.475);
                }
            })
            .style("opacity", function(d) {
                if(boolIsolateOptimal || boolIsolateSelected){
                    return 0.1
                }else{
                    return 1.0
                };
            })
    };

};
var socket = io.connect('http://' + document.domain + ':' + location.port);

console.log(socket);

socket.on('connect', function(){
	socket.emit('client message', {message: 'Established connection to server'});
});
socket.on('disconnect', function(){
	stdout = document.getElementById("stdout");
	stdout.value = stdout.value + '\n' + 'Disconnected from server';
});

socket.on('server message', function(msg){
	console.log(msg);
	stdout = document.getElementById("stdout");
	// console.log(stdout.value);
	if (Object.keys(msg)[0] == 'message'){
		stdout.value = stdout.value + '\n' + msg.message;
		stdout.scrollTop = stdout.scrollHeight;
	}
	// 	stdout.value = stdout.value + '\n' + msg.message
})



createMenu("inputs", "input_0", 0);
createMenu("outputs", "output_0", 0);


function createMenu(section, id){

	var menu_item_id = section + "_" + id

	var target = document.getElementById(section);

	var div = document.createElement("div");
	div.className = "menu_object";
	div.id = menu_item_id;
	target.appendChild(div);

	var button = document.createElement("div");
	button.className = "button";
	button.setAttribute('onclick', 'deleteSet("'+menu_item_id+'", id)');
	button.innerHTML = "<p>X</p>";
	div.appendChild(button);

	var label = document.createElement("div");
	label.className = "label";
	div.appendChild(label);

	var p1 = document.createElement("p");
	label.appendChild(p1);

	var param_name = document.createElement("input"); 
	param_name.className = "param-name";
	param_name.value = id;
	p1.appendChild(param_name);

	var span = document.createElement("div");
	span.className = "menu_item";
	// span.id = menu_item_id;
	div.appendChild(span);

	// var clear = document.createElement("div");
	// clear.className = "clearfix"
	// div.appendChild(clear);

	var p = document.createElement("p"); 
	p.innerHTML = "Type"
	span.appendChild(p);

	var selectList = document.createElement("select");
	var obj_id = section + "_select_" + id;
	selectList.id = obj_id;
	console.log(section);
	selectList.setAttribute('onchange', 'checkSubmenu("'+menu_item_id+'", "'+section+'", id)');
	p.appendChild(selectList);

	if (section == "inputs"){
		var type_options = ["Continuous", "Categorical", "Sequence"];
	}else if (section == "outputs"){
		var type_options = ["Objective", "Constraint"];
	}
	

	for (var i = 0; i < type_options.length; i++){
		var option = document.createElement("option");
		option.value = type_options[i];
		option.text = type_options[i];
		selectList.appendChild(option);
	}

	var option_set = document.createElement("div");
	option_set.className = "option_set"
	span.appendChild(option_set)

	createSubmenu(option_set, section, obj_id);

}

function createSubmenu(option_set, section, obj_id){
	console.log(option_set);

	var val = document.getElementById(obj_id).value;

	if (section == "inputs"){
		if (val == "Continuous"){
			var options = ["Set length", "Min", "Max"];
			var defaults = [1, 0.0, 1.0];
		}else if (val == "Categorical"){
			var options = ["Set length", "Num options"];
			var defaults = [1, 4];
		}else{
			var options = ["Num options"];
			var defaults = [10];
		}

		for (var i = 0; i < options.length; i++){
			var p = document.createElement("p");
			// p.innerHTML = options[i];
			option_set.appendChild(p);

			var txt = document.createElement("span")
			txt.innerHTML = options[i];
			p.appendChild(txt);

			var element = document.createElement("input"); 
		    element.className = "entry"
		    element.value = defaults[i];
	    	p.appendChild(element);
		}


	}else if (section == "outputs"){
		if (val == "Objective"){
			var type_options = ["Minimize", "Maximize"];

			var p = document.createElement("p"); 
			// p.innerHTML = "Goal"
			option_set.appendChild(p);

			var txt = document.createElement("span")
			txt.innerHTML = "Goal";
			p.appendChild(txt);

			var selectList = document.createElement("select");
			p.appendChild(selectList);
			
			for (var i = 0; i < type_options.length; i++){
				var option = document.createElement("option");
				option.value = type_options[i];
				option.text = type_options[i];
				selectList.appendChild(option);
			}

		}else if (val == "Constraint"){
			var type_options = ["Less than", "Equals", "Greater than"];

			var p = document.createElement("p"); 
			// p.innerHTML = "Requirement"
			option_set.appendChild(p);

			var txt = document.createElement("span")
			txt.innerHTML = "Requirement";
			p.appendChild(txt);

			var selectList = document.createElement("select");
			p.appendChild(selectList);
			
			for (var i = 0; i < type_options.length; i++){
				var option = document.createElement("option");
				option.value = type_options[i];
				option.text = type_options[i];
				selectList.appendChild(option);
			}

			var element = document.createElement("input"); 
		    element.className = "entry"
		    element.value = 0.0;
	    	p.appendChild(element);

		}
	}

	
}

function checkSubmenu(target_id, section, select_id){

	var target = document.getElementById(target_id);
	var menu_item = target.querySelector(".menu_item")
	var option_set = menu_item.querySelector(".option_set")

	option_set.parentNode.removeChild(option_set);

	var option_set = document.createElement("div");
	option_set.className = "option_set"
	menu_item.appendChild(option_set)

	createSubmenu(option_set, section, select_id);

}


function addOption(section){

	prefix = section.substring(0, section.length-1)

	// console.log(prefix);

	var target = document.getElementById(section);
	console.log(target)
	// menu_items = target.querySelectorAll(".menu_item")

	// var name = document.getElementById(section + "_entry").value;

	var ids = []
	var children = target.children;
	for (var i = 0; i < children.length; i++){
		n = children[i].getElementsByClassName("param-name")[0].value;
		console.log(n);
		ids.push(n);
		// ids.push(children[i].id);
	}

	for (var i = 0; i < 100; i++){
		name = prefix + "_" + i;
		// name_out = section + "_" + name
		if (ids.indexOf(name) == -1) {
			// console.log(ids.indexOf(name));
			break;
		}
	}

	console.log(ids);

	// var name_out = section + "_" + name;
	// if (ids.indexOf(name_out) >= 0) {
		// alert("WARNING: " + section + " name must be unique");
	// }else{
	createMenu(section, name);
	// }
}

function deleteSet(id) {
	console.log(id);
	var element = document.getElementById(id);
	element.parentNode.removeChild(element);
}


function parseSpec(){

	var json_out = {"inputs": [], "outputs": [], "options": {}};

	var target = document.getElementById("inputs");
	var menu_objects = target.querySelectorAll(".menu_object");

	for (var i = 0; i < menu_objects.length; i++){

		json_out["inputs"].push({});
		var json_item = json_out["inputs"][json_out["inputs"].length-1]

		var menu_object = menu_objects[i];
		var name = menu_object.querySelector(".param-name").value;
		json_item["name"] = name;

		var menu_item = menu_object.querySelector(".menu_item");
		var sel = menu_item.getElementsByTagName("select")[0];
		var type = sel.options[sel.selectedIndex].value;
		json_item["type"] = type;

		var opts = menu_item.querySelector(".option_set");
		var ps = opts.children;

		for (var j = 0; j < ps.length; j++){
			var p = ps[j];
			var prop = p.getElementsByTagName("span")[0].innerHTML;
			var val = p.getElementsByTagName("input")[0].value;

			json_item[prop] = val;
		}
	}

	var target = document.getElementById("outputs");
	var menu_objects = target.querySelectorAll(".menu_object");

	for (var i = 0; i < menu_objects.length; i++){

		json_out["outputs"].push({});
		var json_item = json_out["outputs"][json_out["outputs"].length-1]

		var menu_object = menu_objects[i];
		var name = menu_object.querySelector(".param-name").value;
		json_item["name"] = name;

		var menu_item = menu_object.querySelector(".menu_item");
		var sel = menu_item.getElementsByTagName("select")[0];
		var type = sel.options[sel.selectedIndex].value;
		json_item["type"] = type;

		var opts = menu_item.querySelector(".option_set");
		var ps = opts.children;

		for (var j = 0; j < ps.length; j++){
			var p = ps[j];
			var prop = p.getElementsByTagName("span")[0].innerHTML;
			var val = p.getElementsByTagName("select")[0].value;

			json_item[prop] = val;

			if (type == "Constraint"){
				json_item["val"] = p.getElementsByTagName("input")[0].value;;
			}
		}
	}

	var target = document.getElementById("options");
	var menu_objects = target.children;

	for (var i = 0; i < menu_objects.length; i++){

		p = menu_objects[i];

		var prop = p.getElementsByTagName("span")[0].innerHTML;
		var input = p.getElementsByTagName("input")[0];

		if (input.type == "checkbox"){
			val = input.checked;
		}else{
			val = input.value;
		}

		json_out["options"][prop] = val;
	}
	
	console.log(json_out);
	return json_out;
}


function testInputs() {

	xhr = new XMLHttpRequest();
	var url = "/api/v1.0/test/";
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function () { 
	    if (xhr.readyState == 4 && xhr.status == 200) {
	        var json = JSON.parse(xhr.responseText);
	        console.log(json)
	        if (json.status == 'fail'){
	        	alert("WARNING: Grasshopper connection not found.");
	        }
	    }
	}

	xhr.send(JSON.stringify(parseSpec()));

}

function startOptimization() {

	xhr = new XMLHttpRequest();
	var url = "/api/v1.0/start/";
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function () { 
	    if (xhr.readyState == 4 && xhr.status == 200) {
	        var json = JSON.parse(xhr.responseText);
	        console.log(json)
	        if (json.status == 'fail'){
	        	alert("WARNING: Grasshopper connection not found.");
	        }else{
		        document.getElementById("job-name-entry").value = json.job_id;
	        }
	        
	    }
	}

	xhr.send(JSON.stringify(parseSpec()));

}

function stopOptimization() {

	xhr = new XMLHttpRequest();
	var url = "/api/v1.0/stop/";
	xhr.open("GET", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function () { 
	    if (xhr.readyState == 4 && xhr.status == 200) {
	        var json = JSON.parse(xhr.responseText);
	        console.log(json)
	        if (json.status == 'fail'){
	        	alert("WARNING: Grasshopper connection not found.");
	        }//else{
		        // document.getElementById("job-name-entry").value = json.job_id;

	        // }
	        
	    }
	}

	xhr.send();

}


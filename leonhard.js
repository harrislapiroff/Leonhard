(function () {
	// Namespacing
	var leonhard = window.leonhard
		// Shortcut for this closure
		L = leonhard;
	
	// Some shortcuts:
	window.$V = function (arg) { new L.models.Vertex(arg) };
	window.$E = function (arg1, arg2) { new L.models.Edge(arg1, arg2) };
	
	// setup some containers
	L.models = {};
	L.views = {};
	
	// The Vertex Model!
	L.models.vertices = [];
	L.models.Vertex = function (opts)
		{
			// run the init function
			this.init(opts);
			
			// add this node to our node list
			L.models.vertices.push(this);
		};
	L.models.Vertex.prototype.init = function (opts)
		{
			// for each option, if it's set use it, otherwise null
			this.name = opts.name || null;
			this.color = opts.color || null;
		}
	L.models.Vertex.prototype.connect = function (node)
		{
			// create a new edge connected to this node and the argument
			new L.models.Edge(this, node);
		};
	L.models.Vertex.prototype.getEdges = function ()
		{
			var vertices, i, out = [];
			// iterate over ALL the edges (is this the most efficient way?)
			for (i = 0; i < L.models.edges.length; i++){
				// get the vertices
				vertices = L.models.edges[i].getVertexs();
				// does the first node match?
				if(vertices[0]==this){
					out.push(L.models.edges[i]);
				}
				// does the second node match?
				if(vertices[1]==this){
					out.push(L.models.edges[i]);
				}
			}
			// push the whole array out
			return out;
		};
	L.models.Vertex.prototype.getAdjacent = function ()
		{
			var edges, i, out = [];
			// get the edges
			edges = this.getEdges();
			// iterate over all connected edges
			for(i = 0; i < edges.length; i++){
				// if this is node one, return node two
				if(edges[i].n1==this){
					out.push(edges[i].n2);
				// if this is node two, return node one
				}else{
					out.push(edges[i].n1);
				}
			}
			// push the whole array out
			return out;
		};
	
	// The Edge Model!
	L.models.edges = [];
	L.models.Edge = function (node1, node2)
		{
			this.init(node1, node2);
			L.models.edges.push(this);
		};
	L.models.Edge.prototype.init = function (node1, node2)
		{
			this.setVertexs(node1, node2)
			return this;
		};
	L.models.Edge.prototype.getVertexs = function ()
		{
			return [this.n1, this.n2];
		};
	L.models.Edge.prototype.setVertexs = function (node1, node2)
		{
			if(typeof node1 != 'array'){
				arr = [node1, node2];
			}
			this.n1 = arr[0];
			this.n2 = arr[1];
		};
	
	// A quick and rough view, just as a sample. I think views should take a set of vertices and edges?
	// Maybe I need a graph object...
	L.views.Bullets = function (vertices, edges) {
		var i, el;
		el = document.createElement('div');
		for (i = 0; i < vertices.length; i++){
			el.innerHTML = el.innerHTML + '<div class="node" id="'+vertices[i].name+'">&bull;</div>';
		}
		for (i = 0; i < edges.length; i++){
			el.innerHTML = el.innerHTML + '<div class="edge" id="'+edges[i].n1.name+'_'+edges[i].n2.name+'">|</div>';
		}
		document.body.appendChild(el);
		return el;
	}
}());
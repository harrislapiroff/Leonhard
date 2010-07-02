(function () {
	// Namespacing
	var leonhard = window.leonhard = {},
		L = leonhard;
	
	// Some shortcuts:
	window.$Vertex = function (arg, par) { new L.models.Vertex(arg, par) };
	window.$Node = $Vertex;
	window.$Edge = function (arg1, arg2, par) { new L.models.Edge(arg1, arg2, par) };
	window._;
	
	// setup some containers
	L.models = {};
	L.views = {};
	
	// The Graph Model!
	L.models.graphs = []
	
	L.models.Graph = function ()
		{
			this.vertices = [];
			this.edges = [];
		};
	L.models.Graph.prototype.vertex =
	L.models.Graph.prototype.node = function (arg)
		{
			arg.parent = this;
			$Vertex(arg);
		};
	L.models.Graph.prototype.edge = function(arg1, arg2)
		{
			$Edge(arg1, arg2, this);
		};
	
	// The Vertex Model!
	L.models.vertices = [];
	
	// we'll use the alias node where we can
	L.models.nodes = L.models.vertices;
	L.models.Node = L.models.Vertex;
	
	L.models.Vertex = function (opts)
		{
			// run the init function
			this.init(opts);
			
			// add this node to our node list
			this.parent.vertices.push(this);
		};
	L.models.Vertex.prototype.init = function (opts)
		{
			opts = opts || {};
			// for each option, if it's set use it, otherwise null
			this.name = opts.name || null;
			this.color = opts.color || null;
			this.parent = opts.parent || L.models;
		}
	L.models.Vertex.prototype.connect = function (node)
		{
			// create a new edge connected to this node and the argument
			new L.models.Edge(this, node, {'parent': this.parent});
		};
	L.models.Vertex.prototype.getEdges = function ()
		{
			var vertices,
				i,
				out = [];
				
			// iterate over ALL the edges (is this the most efficient way?)
			for (i = 0; i < L.models.edges.length; i++) {
				// get the vertices
				vertices = L.models.edges[i].getVertices();
				// does the first node match?
				if (vertices[0]==this) {
					out.push(L.models.edges[i]);
				}
				// does the second node match?
				if (vertices[1]==this) {
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
			for (i = 0; i < edges.length; i++) {
				// if this is node one, return node two
				if (edges[i].n1==this) {
					out.push(edges[i].n2);
				// if this is node two, return node one
				} else {
					out.push(edges[i].n1);
				}
			}
			// push the whole array out
			return out;
		};
	L.models.Vertex.prototype.adjacent = function (vertex)
		{
			// get a list of vertices adjacent to this
			var adjacentVertices = this.getAdjacent(),
				i;
			// iterate through each of those adjacent vertices
			for (i=0; i < adjacentVertices.length; i++) {
				// if they are the same as the vertex provided as argument, return true
				if(adjacentVertices[i] == vertex){
					return true;
				}
			}
			// if we iterate through all of them and never get a true, return false.
			return false;
		}
		
	// The Edge Model!
	L.models.edges = [];
	L.models.Edge = function (node1, node2, opts)
		{
			// list of properties
			this.n1;
			this.n2;
			this.directed;
			
			// initialize
			this.init(node1, node2, opts);
			
			// add to the list of edges
			this.parent.edges.push(this);
		};
	L.models.Edge.prototype.init = function (node1, node2, opts)
		{
			
			this.setVertices(node1, node2);
			this.undirected();
			
			opts = opts || {};
			this.parent = opts.parent || L.models;
			
			return this;
		};
	L.models.Edge.prototype.getVertices = function ()
		{
			return [this.n1, this.n2];
		};
	L.models.Edge.prototype.setVertices = function (node1, node2)
		{
			if(typeof node1 != 'array'){
				arr = [node1, node2];
			}
			// if trying to draw an edge between a node and itself throw exception
			if(node1 == node2){
				throw('A vertex cannot be connected to itself');
			}
			// if they are already adjacent, do nothing
			if(node1.adjacent(node2)){
				return this;
			}
			this.n1 = arr[0];
			this.n2 = arr[1];
			return this;
		};
	L.models.Edge.prototype.directed = function ()
		{
			this.directed = true;
		}
	L.models.Edge.prototype.undirected = function ()
		{
			this.directed = false;
		}
	
	// A quick and rough view, just as a sample. I think views should take a set of vertices and edges?
	// Maybe I need a graph object...
	L.views.Bullets = function (vertices, edges)
		{
			var i,
				el;
			
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
		
	L.views.SVG = function (graph, opts)
		{
			this.graph = graph || L.models;
			this.opts = opts || {};
			
			this.init();
		};
	L.views.SVG.prototype.init = function ()
		{
			this.width = this.opts.width || 1200;
			this.height = this.opts.height || 600;
			this.c = Raphael(0, 0, this.width, this.height);
			this.render();
		};
	L.views.SVG.prototype.render = function ()
		{
			var vertices = this.graph.vertices,
				edges = this.graph.edges,
				i,
				v = [],
				e = [],
				c = this.c;
				
			this.c.clear();
			
			for ( key in vertices ) {
				i = v.push(vertices[key]);
				vertices[key].view =
					{
						'cx':Math.random(),
						'cy':Math.random(),
						'el': c.circle().attr({'fill':'#067','stroke':'#999'})
					};
				vertices[key].view.el.attr({'cx': vertices[key].view.cx * this.width, 'cy': vertices[key].view.cy * this.height, 'r':'3', 'style': 'z-index:999'})
			}
			for ( key in edges ) {
				var verts = edges[key].getVertices(),
					start = [verts[0].view.cx, verts[0].view.cy],
					end = [verts[1].view.cx, verts[1].view.cy];
				edges[key].view =
					{
						'el': c.path('M' + (start[0] * this.width) + ' ' + (start[1] * this.height) + 'L' + (end[0] * this.width) + ' ' + (end[1] * this.height)).attr({'stroke':'#999'})
					};
			}
		};
	
}());
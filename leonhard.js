(function () {
	// Namespacing
	var leonhard = window.leonhard = {},
		L = leonhard;
	
	// Some shortcuts:
	window.$Vertex = function (arg) { new L.models.Vertex(arg) };
	window.$Node = $Vertex;
	window.$Edge = function (arg1, arg2) { new L.models.Edge(arg1, arg2) };
	window._;
	
	// setup some containers
	L.models = {};
	L.views = {};
	
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
	L.models.Edge = function (node1, node2)
		{
			// list of properties
			this.n1;
			this.n2;
			this.directed;
			
			// initialize
			this.init(node1, node2);
			
			// add to the list of edges
			L.models.edges.push(this);
		};
	L.models.Edge.prototype.init = function (node1, node2)
		{
			
			this.setVertices(node1, node2);
			this.undirected();
			
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
		
	L.views.SVG = function (vertices, edges)
		{
			var i,
				v = [],
				e = [],
				c = Raphael(0,0,600,600);
				
			for ( key in vertices ) {
				i = v.push(vertices[key]);
				vertices[key].view =
					{
						'cx':Math.random()*600,
						'cy':Math.random()*600,
						'el': c.circle().attr({'fill':'#F00','stroke':'none'})
					}
				vertices[key].view.el.attr({'cx': vertices[key].view.cx, 'cy': vertices[key].view.cy, 'r':'3'})
			}
			for ( key in edges ) {
				var verts = edges[key].getVertices(),
					start = [verts[0].view.cx, verts[0].view.cy],
					end = [verts[1].view.cx, verts[1].view.cy];
				edges[key].view =
					{
						'el': c.path('M'+start[0]+' '+start[1]+'L'+end[0]+' '+end[1])
					}
			}
			
		}
	
}());
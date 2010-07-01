(function () {
	// Namespacing
	var leonhard = window.leonhard = {},
		L = leonhard;
	
	// Some shortcuts:
	window.$Vertex = function (arg) { new L.models.Vertex(arg) };
	window.$Node = $Vertex;
	window.$Edge = function (arg1, arg2) { new L.models.Edge(arg1, arg2) };
	window._
	
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
			this.init(node1, node2);
			L.models.edges.push(this);
		};
	L.models.Edge.prototype.init = function (node1, node2)
		{
			this.setVertices(node1, node2)
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
	
	// A view using a force based algorithm and a canvas
	// http://en.wikipedia.org/wiki/Force-based_algorithms_(graph_drawing)
/*	L.views.FBA = function (vertices, edges)
		{
			var i,j,
				locations = [],
				velocities = [],
				energy=1,
				force = [],
				direction = [],
				// a quick R2 vector class
				V = function(a1,a2){
					if(this instanceof arguments.callee){
						this.a1 = a1;
						this.a2 = a2;
						this.d = function (v) {
							return Math.sqrt(((this.a1 - v.a1)*(this.a1 - v.a1))+((this.a2 - v.a2)*(this.a2 - v.a2)));
						}
						this.plus = function (v) {
							return V(this.a1+v.a1,this.a2+v.a2);
						}
						this.minus = function (v) {
							return V(this.a1-v.a1,this.a2-v.a2);
						}
						this.length = function (v) {
							return Math.sqrt((this.a1*this.a1)+(this.a2*this.a2));
						}
						this.normal = function () {
							return V(this.a1/this.length(),this.a2/this.length())
						}
						this.reverse = function () {
							return V(0,0).minus(this);
						}
					}else{
						return new V(a1,a2)
					}
				};
				
			// for each vertex
			// set its position to two random numbers
			// set its velocity to 0,0
			for (i = 0; i < vertices.length; i++) {
				velocities.push(V(0,0));
				force.push(V(0,0));
				direction.push([]);
				locations.push(V(Math.random(), Math.random()));
			}
			
			// loop
			while (energy > .001) {
				for (i = 0; i < vertices.length; i++) {
					force[i] = V(0,0);
					// for every other vector j not the same as i
					for (j = 0; j < vertices.length; j++){ if(j!=i){
						direction[i][j] = locations[i].minus(locations[j]).normal();
						force[i]=force[i].plus(V(
							(1-locations[i].d(locations[j]))*.001*direction[i][j].a1,
							(1-locations[i].d(locations[j]))*.001*direction[i][j].a2
						))
					}}					
				}
				energy=0;
			}
		}
*/
		L.views.FBA = function (vertices, edges) {
			var vreps=[],
				ereps=[],
				i, j, direction, loopcount = 0,
				energy = 1,
				// a quick R2 vector class
				V = function(a1,a2){
					if(this instanceof arguments.callee){
						this.a1 = a1;
						this.a2 = a2;
						this.d = function (v) {
							return Math.sqrt(((this.a1 - v.a1)*(this.a1 - v.a1))+((this.a2 - v.a2)*(this.a2 - v.a2)));
						}
						this.plus = function (v) {
							return V(this.a1+v.a1,this.a2+v.a2);
						}
						this.minus = function (v) {
							return V(this.a1-v.a1,this.a2-v.a2);
						}
						this.length = function (v) {
							return Math.sqrt((this.a1*this.a1)+(this.a2*this.a2));
						}
						this.normal = function () {
							return V(this.a1/this.length(),this.a2/this.length())
						}
						this.reverse = function () {
							return V(0,0).minus(this);
						}
					}else{
						return new V(a1,a2)
					}
				};;
				
			for (i = 0; i<vertices.length; i++) {
				vreps.push({
					vertex: vertices[i],
					location: V(Math.random()/2,Math.random()/2),
					velocity: V(0,0),
					el: document.createElement('div')
				});
				vreps[i].el.innerHTML='&bull; '+vreps[i].vertex.name;
				document.body.appendChild(vreps[i].el);
			}
			
			while (energy > .5) {
				loopcount++;
				// position all of the elements
				for (i = 0; i < vreps.length; i++) {
					vreps[i].velocity = V(0,0)
					for (j = 0; j < vreps.length; j++) {
						if(i!=j){
							direction = vreps[i].location.minus(vreps[j].location).normal();
							vreps[i].velocity = vreps[i].velocity.plus(V(
								(Math.abs(1-vreps[i].location.d(vreps[j].location)))*(.1/loopcount)*direction.a1,
								(Math.abs(1-vreps[i].location.d(vreps[j].location)))*(.1/loopcount)*direction.a2
							));
						}
					}
					for (j = 0; j < vreps.length; j++) {
						if( vreps[i].vertex.adjacent(vreps[j].vertex) ){
							direction = vreps[i].location.minus(vreps[j].location).normal();
							vreps[i].velocity = vreps[i].velocity.minus(V(
								(Math.abs(1-vreps[i].location.d(vreps[j].location)))*(.1/loopcount)*direction.a1,
								(Math.abs(1-vreps[i].location.d(vreps[j].location)))*(.1/loopcount)*direction.a2
							));
						}
					}
					vreps[i].location = vreps[i].location.plus(vreps[i].velocity);
					vreps[i].el.setAttribute('style','position:absolute;font-size:10px;top:'+vreps[i].location.a1*window.innerHeight+'px;left:'+vreps[i].location.a2*window.innerWidth+'px;')
				}
				energy = energy - .00001;
			}
		}
}());
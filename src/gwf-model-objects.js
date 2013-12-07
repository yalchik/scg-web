///// nodes


var GwfObject = function (args) {

    this.id = -1;
    this.attributes = {};
    this.required_attrs = [];


}

GwfObject.prototype = {
    constructor: GwfObject
}

GwfObject.prototype.parseObject = function (args) {

}

GwfObject.prototype.buildObject = function (args) {

}

GwfObject.prototype.parsePoints = function (args) {

    var gwf_object = args.gwf_object;
    var reader = args.reader;

    var points = gwf_object.getElementsByTagName("points")[0].getElementsByTagName("point");
    this.attributes.points = [];
    for (var i = 0; i < points.length; i++) {
        this.attributes.points.push(reader.fetchAttributes(points[i], ["x", "y"]));
    }
}

GwfObject.prototype.fixParent = function (args) {


    var parent = this.attributes["parent"];

    if (parent != "0") {
        var parent_object = args.builder.getOrCreate(parent);
        parent_object.addChild(args.scg_object);
        parent_object.update();
    }
}


var GwfObjectNode = function (args) {

    GwfObject.call(this, args);
    this.required_attrs = ["id", "type", "x", "y", "parent", "idtf"];
}

GwfObjectNode.prototype = Object.create(GwfObject.prototype);

// have to specify node and reader
GwfObjectNode.prototype.parseObject = function (args) {
    var node = args.gwf_object;
    var reader = args.reader;

    this.attributes = reader.fetchAttributes(node, this.required_attrs);

    if (this.attributes == false)
        return false;


    //fix some attrs
    this.attributes["type"] = reader.getTypeCode(this.attributes.type);
    this.attributes["x"] = parseFloat(this.attributes["x"]);
    this.attributes["y"] = parseFloat(this.attributes["y"]);

    this.id = this.attributes["id"];
    return this;
}

// have to specify scene,builder
GwfObjectNode.prototype.buildObject = function (args) {
    var scene = args.scene;
    var builder = args.builder;

    var node = scene.createNode(this.attributes["type"], new SCg.Vector3(this.attributes["x"] + 100, this.attributes["y"], 0), this.attributes["idtf"]);

    args.scg_object = node;

    this.fixParent(args);

    node.update();
    return node;
}

///// pairs

var GwfObjectPair = function (args) {
    GwfObject.call(this, args);

    this.required_attrs = ["id", "type", "id_b", "id_e", "dotBBalance", "dotEBalance", "idtf"];
}

GwfObjectPair.prototype = Object.create(GwfObject.prototype);

// have to specify pair and reader
GwfObjectPair.prototype.parseObject = function (args) {
    var pair = args.gwf_object;
    var reader = args.reader;

    this.attributes = reader.fetchAttributes(pair, this.required_attrs);

    if (this.attributes == false)
        return false;

    //fix some attrs

    this.attributes["type"] = reader.getTypeCode(this.attributes.type);
    this.attributes["dotBBalance"] = parseFloat(this.attributes["dotBBalance"])
    this.attributes["dotEBalance"] = parseFloat(this.attributes["dotEBalance"])

    this.id = this.attributes["id"];

    // line points

    this.parsePoints(args);

    return this;

}
GwfObjectPair.prototype.buildObject = function (args) {
    var scene = args.scene;
    var builder = args.builder;

    var source = builder.getOrCreate(this.attributes["id_b"]);
    var target = builder.getOrCreate(this.attributes["id_e"]);

    var edge = scene.createEdge(source, target, this.attributes["type"]);
    edge.source_dot = parseFloat(this.attributes["dotBBalance"]);
    edge.target_dot = parseFloat(this.attributes["dotEBalance"]);


    var edge_points = this.attributes["points"];
    var points = [];

    for (var i = 0; i < edge_points.length; i++) {
        var edge_point = edge_points[i];
        var point = new SCg.Vector2(parseFloat(edge_point.x) + 100, parseFloat(edge_point.y));
        points.push(point);
    }
    edge.setPoints(points);

    edge.update();

    return edge;
}

//contour

var GwfObjectContour = function (args) {
    GwfObject.call(this, args);
    this.required_attrs = ["id", "parent"];
}

GwfObjectContour.prototype = Object.create(GwfObject.prototype);

GwfObjectContour.prototype.parseObject = function (args) {
    var contour = args.gwf_object;
    var reader = args.reader;

    this.attributes = reader.fetchAttributes(contour, this.required_attrs);

    if (this.attributes == false)
        return false;

    this.id = this.attributes['id'];

    //contour points
    this.parsePoints(args);

    return this;
}

GwfObjectContour.prototype.buildObject = function (args) {
    var scene = args.scene;

    var contour_points = this.attributes["points"];

    var verticies = [];

    for (var i = 0; i < contour_points.length; i++) {
        var contour_point = contour_points[i];
        var vertex_x = parseFloat(contour_point.x);

        var vertex_y = parseFloat(contour_point.y);


        var vertex = new SCg.Vector3(vertex_x + 100, vertex_y, 0);
        verticies.push(vertex);
    }

    var contour = new SCg.ModelContour({
        verticies: verticies
    });


    args.scg_object = contour;
    this.fixParent(args);

    scene.appendContour(contour);

    contour.update();
    return contour;
}


var GwfObjectBus = function (args) {
    GwfObject.call(this, args);
    this.required_attrs = ["id", "parent", "b_x", "b_y", "e_x", "e_y", "owner", "idtf"];
}

GwfObjectBus.prototype = Object.create(GwfObject.prototype);

GwfObjectBus.prototype.parseObject = function (args) {
    var bus = args.gwf_object;
    var reader = args.reader;

    this.attributes = reader.fetchAttributes(bus, this.required_attrs);

    if (this.attributes == false)
        return false;

    this.id = this.attributes['id'];

    //bus points
    this.parsePoints(args);

    return this;
}

GwfObjectBus.prototype.buildObject = function (args) {
    var scene = args.scene;
    var builder = args.builder;



    var bus = new SCg.ModelBus({});

    bus.setSource(builder.getOrCreate(this.attributes["owner"]));
    bus.setTargetDot(0);

    var bus_points = this.attributes["points"];
    var points = [];

    for(var i = 0; i < bus_points.length; i++){
        var bus_point = bus_points[i];
        var point = new SCg.Vector2(parseFloat(bus_point.x) + 100, parseFloat(bus_point.y));
        points.push(point);
    }

    points.push(new SCg.Vector2(parseFloat(this.attributes["e_x"]) + 100, parseFloat(this.attributes["e_y"])))

    bus.setPoints(points);

    args.scg_object = bus;
    this.fixParent(args);

    bus.update();
    scene.appendBus(bus);

    return bus;
}


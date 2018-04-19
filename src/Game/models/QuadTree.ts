//Quadtree needs to keep track of points this needs to track 2d shapes
//checkout https://github.com/MicahFulton/TypedQuadTree.git 
import {GJk} from './GJKCollisionDetection'
import { Vec2, WorldObject } from './World';

export class QuadTree {
    NODE_MAX_CAPACITY : number =4
    border: boundingBox

    members: Array<WorldObject> = []

    nw !: QuadTree
    sw !: QuadTree
    ne !: QuadTree
    se !: QuadTree

    constructor(boundary: boundingBox) {
        this.border = boundary
    }
    //if a node is terminal it will have no children
    isTerminal() :boolean {
        return !this.nw
    }

    insert(p: WorldObject):boolean {
        //if the point already exists 
        // this does not handle the case when the objects cross over the corner of a node
        if (p.kind == 'rectangle'){
            if (this.border.containsPoint(p.point1) || this.border.containsPoint(p.point2)){
                return false;
            }
        }
        if(p.kind == 'polygon') {
            p.edges.forEach(element => {
                if(this.border.containsPoint(element)){
                    return false;
                }
            });
        }
        //if there is room in the node
        if (this.members && this.members.length < this.NODE_MAX_CAPACITY) {
            this.members.push(p)
            return true
        }
        //need to make a new node
        if(this.isTerminal()) {
            this.subDivide(); 
        }
        return this.nw.insert(p) || this.ne.insert(p) || this.sw.insert(p) || this.se.insert(p)
    }

    subDivide(): void {
        var box: boundingBox;
        var newBoundry: number = this.border.halfDim/2;

        box = new boundingBox({
            x: this.border.center.x + newBoundry,
            y: this.border.center.y + newBoundry,
        }, newBoundry)
        this.nw = new QuadTree(box);

        box = new boundingBox({
            x: this.border.center.x - newBoundry,
            y: this.border.center.y - newBoundry,
        }, newBoundry)
        this.sw = new QuadTree(box)
        
        box = new boundingBox({
            x: this.border.center.x + newBoundry,
            y: this.border.center.y - newBoundry,
        }, newBoundry)
        this.ne = new QuadTree(box)
        
        box = new boundingBox({
            x: this.border.center.x - newBoundry,
            y: this.border.center.y + newBoundry,
        }, newBoundry)
        this.se = new QuadTree(box)
        
        this.members.forEach((member: WorldObject) => {
            this.nw.insert(member) ||
            this.ne.insert(member) ||
            this.sw.insert(member) ||
            this.se.insert(member)
        });
        this.members = [] 
    }
    //test for collisons in the tree
    collide(p:WorldObject, node: QuadTree) : WorldObject| null {
        //check if it collides with something and return that object if it does
        if (node.isTerminal){
            //Is a termnial node
            node.members.forEach(element => {
               //testfor collisons 
               
               return p
            });
        }
        else {
            this.collide(p, node.nw)
            this.collide(p, node.ne)
            this.collide(p, node.sw)
            this.collide(p, node.se)
        }
        //if it doesn't collide with anything have it return null
        return null
    }
}

interface border {
    center : Vec2 
    halfDim : number;
    containsPoint(p: Vec2): boolean
    intersectsBorder(other: border) :boolean
}

export class boundingBox implements border {
    center : Vec2 
    halfDim : number;

    constructor(center: Vec2, halfDim: number) {
        this.center = center
        this.halfDim = halfDim
    }

    containsPoint(p: Vec2): boolean {
        if(p.x < (this.center.x - this.halfDim)){
            return false
        }
        if(p.x > (this.center.x + this.halfDim)){
            return false
        }
        if(p.y < (this.center.y - this.halfDim)){
            return false
        }
        if(p.y > (this.center.y + this.halfDim)){
            return false
        }
        return true;
    }

    intersectsBorder(other:border):boolean {
        if (other.center.x + other.halfDim < this.center.x - this.halfDim){
            return false
        }
        if (other.center.x - other.halfDim > this.center.x + this.halfDim){
            return false
        }
        if (other.center.y + other.halfDim < this.center.y - this.halfDim){
            return false
        }
        if (other.center.y - other.halfDim > this.center.y + this.halfDim){
            return false
        }
        return true
    }
}

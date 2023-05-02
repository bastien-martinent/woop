export class Tree{
    constructor() {
        this.root = null
    }
    insert( value ) {
        if( Array.isArray( value ) ){
            value.forEach( ( v ) =>{ this.insert( v ) } )
            return
        }
        if( this.root === null ){
            this.root = new Node( value )
            return
        }
        this.root.insert( value )
    }
    traverse( value ){
        if( this.root !== null ){ this.root.traverse( value ) }
    }
}

export class Node{
    constructor( value ) {
        this.value = value
        this.left  = null
        this.right = null
    }
    insert( value ){
        if( value < this.value ){
            if( this.left === null ){
                this.left = new Node( value )
                return
            }
            this.left.insert( value )
        }else{
            if( this.right === null ){
                this.right = new Node( value )
                return
            }
            this.right.insert( value )
        }
    }
    traverse( value ){
        if( value <= this.value ){
            if( this.left ){ this.left.traverse( value ) }
            if( this.right ){ this.right.traverse( value ) }
        }else{
            if( this.right ){ this.right.traverse( value ) }
            if( this.left ){ this.left.traverse( value ) }
        }
    }
}

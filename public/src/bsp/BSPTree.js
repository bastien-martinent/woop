export class BSPTree{
    constructor( nodes, sub_sector = null, segments = null ) {
        this.root       = nodes[ nodes.length-1 ]
        this.nodes      = nodes
        this.sub_sector = sub_sector
        this.segments   = segments
    }
    set_player( player ){
        this.player = player
    }
}

export class BSPNode{
    constructor( right_node, left_node, partition_line, right_boundbox, left_boundbox ) {
        this.right          = right_node
        this.left           = left_node
        this.partition_line = partition_line
        this.right_boundbox = right_boundbox
        this.left_boundbox  = left_boundbox
    }
    /*
    insert( value ){
        if( value < this.value ){
            if( this.left === null ){
                this.left = new BSPNode( value )
                return
            }
            this.left.insert( value )
        }else{
            if( this.right === null ){
                this.right = new BSPNode( value )
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
    */
}

export class BoundBox{
    constructor( top_left, bottom_right ){
        this.top_left     = top_left
        this.bottom_right = bottom_right
    }
}
export class PartitionLine{
    constructor( start, end ){
        this.start = start
        this.end   = end
    }
}
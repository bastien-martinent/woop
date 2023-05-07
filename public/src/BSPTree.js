export class BSPTree{
    constructor( nodes ) {
        this.root       = nodes[ nodes.length-1 ]
        this.nodes      = nodes
    }
    set_player( player ){
        this.player = player
    }
    wait = (ms) => {
        const start = window.performance.now()
        let now = start
        while ( now - start < ms) {
            now = window.performance.now()
        }
    }
    render_node( renderer, offset_x, offset_y, player, node = this.root ){
        if( node instanceof SubSector ){
            return
        }
        if( this.is_right( player, node ) ){
            this.render_node( renderer, offset_x, offset_y, player, node.right )
            this.render_node( renderer, offset_x, offset_y,  player, node.left )
        }
        this.render_node( renderer, offset_x, offset_y, player, node.left )
        this.render_node( renderer, offset_x, offset_y, player, node.right )
    }
    is_right( player, node ){
        let dx = player.position.x - node.partition_line.start.x
        let dy = player.position.y - node.partition_line.start.y
        return ( ( dx * node.partition_line.x_direction ) - ( dy * node.partition_line.y_direction ) >= 0 )
    }

}

export class BSPNode{
    constructor( right_node, left_node, right_bound_box, left_bound_box, partition_line ) {
        this.right            = right_node
        this.left             = left_node
        this.right_bound_box  = right_bound_box
        this.left_bound_box   = left_bound_box
        this.partition_line   = partition_line
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
    constructor( start, end, x_direction = null, y_direction= null ){
        this.start = start
        this.end   = end
        this.x_direction = ( x_direction !== null ) ? x_direction : end.x - start.x
        this.y_direction = ( y_direction !== null ) ? y_direction : end.y - start.y
    }
}
export class SubSector{
    constructor( segments ){
        this.segments = segments
    }
}
export class Segment{
    constructor( vertex_start, vertex_end, angle, direction, offset, edge ){
        this.vertices = [ vertex_start, vertex_end ]
        this.angle = angle
        this.direction = direction
        this.offset = offset
        this.edge = edge
    }
}
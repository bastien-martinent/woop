import Int2DVertex from "./Int2DVertex.js"
import Int3DVertex from "./Int3DVertex.js"
import Math3d from "./../tool/Math3d.js"
const math_3d = new Math3d()

export default class Edge {
    constructor( vertex_start, vertex_end, color = 1, facing = 0 ){
        this.distance = 0
        this.facing   = 0
        this.vertexes = [ vertex_start, vertex_end ]
        this.textures = {
            up     : null,
            middle : null,
            down   : null,
        },
        this.color  = color
    }
    points_to_vertices( parent_sector, camera, screen, point_1, point_2, update_distance = true  ) {
        // worlds position
        let tmp
        tmp = point_1.y * math_3d.lookup_table.cos[ camera.look_horizontal ] + point_1.x * math_3d.lookup_table.sin[ camera.look_horizontal ]
        let vertex_1 = new Int3DVertex(
            point_1.x * math_3d.lookup_table.cos[ camera.look_horizontal ] - point_1.y * math_3d.lookup_table.sin[ camera.look_horizontal ],
            tmp,
            parent_sector.bottom_z - camera.z_position + ((camera.look_vertical * tmp) / 32)
        )
        tmp = point_2.y * math_3d.lookup_table.cos[camera.look_horizontal] + point_2.x * math_3d.lookup_table.sin[ camera.look_horizontal ]
        let vertex_2 = new Int3DVertex(
            point_2.x * math_3d.lookup_table.cos[camera.look_horizontal] - point_2.y * math_3d.lookup_table.sin[ camera.look_horizontal ],
            tmp,
            parent_sector.bottom_z - camera.z_position + ( ( camera.look_vertical * tmp ) / 32 )
        )
        let vertex_3 = new Int3DVertex( vertex_1.x, vertex_1.y, vertex_1.z + parent_sector.top_z )
        let vertex_4 = new Int3DVertex( vertex_2.x, vertex_2.y, vertex_2.z + parent_sector.top_z )

        // set distance before screen transformation
        if( update_distance ){
            this.distance = math_3d.get_distance(
                new Int2DVertex( 0, 0 ),
                new Int2DVertex( ( vertex_1.x + vertex_2.x ) / 2, ( vertex_1.y + vertex_1.y ) / 2 )
            )
            parent_sector.distance = this.distance
        }

        // do not draw wall behind camera
        if( vertex_1.y < 1 && vertex_2.y < 1 ){ return [] }
        // clip wall partially behind camera
        if( vertex_1.y < 1 ){
            math_3d.clip_behind_player( vertex_1, vertex_2 ) //bottom line
            math_3d.clip_behind_player( vertex_3, vertex_4 ) //top line
        }
        if( vertex_2.y < 1 ){
            math_3d.clip_behind_player( vertex_2, vertex_1 ) //bottom line
            math_3d.clip_behind_player( vertex_4, vertex_3 ) //top line
        }

        // screen x, screen y position
        vertex_1.set_x( ( vertex_1.x * 200) / vertex_1.y + screen.internal_width_2 )
        vertex_1.set_y( ( vertex_1.z * 200) / vertex_1.y + screen.internal_height_2 )
        vertex_2.set_x( ( vertex_2.x * 200) / vertex_2.y + screen.internal_width_2 )
        vertex_2.set_y( ( vertex_2.z * 200) / vertex_2.y + screen.internal_height_2 )
        vertex_3.set_x( ( vertex_3.x * 200) / vertex_3.y + screen.internal_width_2 )
        vertex_3.set_y( ( vertex_3.z * 200) / vertex_3.y + screen.internal_height_2 )
        vertex_4.set_x( ( vertex_4.x * 200) / vertex_4.y + screen.internal_width_2 )
        vertex_4.set_y( ( vertex_4.z * 200) / vertex_4.y + screen.internal_height_2 )

        return [ vertex_1, vertex_2, vertex_3, vertex_4 ]
    }

    collect_points( parent_sector, camera, screen ){

        // offset bottom 2 points by camera
        let bottom_point_1 = new Int2DVertex( this.vertexes[ 1 - this.facing ].x - camera.x_position, this.vertexes[ 1 - this.facing ].y - camera.y_position )
        let bottom_point_2 = new Int2DVertex( this.vertexes[ 0 + this.facing ].x - camera.x_position, this.vertexes[ 0 + this.facing ].y - camera.y_position )
        let vertices       = this.vertexes_to_vertices( parent_sector, camera, screen, bottom_point_1, bottom_point_2, false )

        // nothing to collect
        if( vertices.length === 0 ){ return }

        let x1 = vertices[ 0 ].x
        let x2 = vertices[ 1 ].x
        let dyb = vertices[ 1 ].y - vertices[ 0 ].y // y distance of bottom line
        let dyt = vertices[ 3 ].y - vertices[ 2 ].y // y distance of top line
        let dx  = x2 - x1 // x distance
        let xs  = x1      // hold initial x1 starting position

        if( dx === 0 ){ dx = 1 } // do not divide by 0
        // clip x
        if( x1 < 0 ){ x1 = 0 }
        if( x2 < 0 ){ x2 = 0 }
        if( x1 > screen.internal_width - 1 ){ x1 = screen.internal_width - 1 }
        if( x2 > screen.internal_width - 1 ){ x2 = screen.internal_width - 1 }

        // draw x vertical lines
        for( let x = x1; x < x2; x++ ){
            // the y start and end point
            let y1 = Math.round( dyb * ( x - xs + .5 ) / dx + vertices[ 0 ].y )
            let y2 = Math.round( dyt * ( x - xs + .5 ) / dx + vertices[ 2 ].y )
            // clip y
            if( y1 < 0 ){ y1 = 0 }
            if( y2 < 0 ){ y2 = 0 }
            if( y1 > screen.internal_height - 1 ){ y1 = screen.internal_height - 1 }
            if( y2 > screen.internal_height - 1 ){ y2 = screen.internal_height - 1 }
            // save surface points
            if( parent_sector.surface.state === 1 ){
                parent_sector.surface.points[ x ] = y1
                continue
            }
            if( parent_sector.surface.state === 2 ){
                parent_sector.surface.points[ x ] = y2
                continue
            }
        }

    }

    draw_edge( parent_sector, camera, screen ){

        // offset bottom 2 points by camera
        let bottom_point_1 = new Int2DVertex( this.vertexes[ 0 + this.facing ].x - camera.x_position, this.vertexes[ 0 + this.facing ].y - camera.y_position )
        let bottom_point_2 = new Int2DVertex( this.vertexes[ 1 - this.facing ].x - camera.x_position, this.vertexes[ 1 - this.facing ].y - camera.y_position )
        let vertices = this.vertexes_to_vertices( parent_sector, camera, screen, bottom_point_1, bottom_point_2 )

        // nothing to draw
        if( vertices.length === 0 ){ return }


        let x1 = vertices[ 0 ].x
        let x2 = vertices[ 1 ].x
        let dyb = vertices[ 1 ].y - vertices[ 0 ].y // y distance of bottom line
        let dyt = vertices[ 3 ].y - vertices[ 2 ].y // y distance of top line
        let dx  = x2 - x1 // x distance
        let xs  = x1      // hold initial x1 starting position
        // clip x
        if( dx === 0 ){ dx = 1 }
        if( x1 < 0 ){ x1 = 0 }
        if( x2 < 0 ){ x2 = 0 }
        if( x1 > screen.internal_width - 1 ){ x1 = screen.internal_width - 1 }
        if( x2 > screen.internal_width - 1 ){ x2 = screen.internal_width - 1 }

        // draw x vertical lines
        for( let x = x1; x < x2; x++ ){
            // the y start and end point
            let y1 = Math.round( dyb * ( x - xs + .5 ) / dx + vertices[ 0 ].y )
            let y2 = Math.round( dyt * ( x - xs + .5 ) / dx + vertices[ 2 ].y )
            // clip y
            if( y1 < 0 ){ y1 = 0 }
            if( y2 < 0 ){ y2 = 0 }
            if( y1 > screen.internal_height - 1 ){ y1 = screen.internal_height - 1 }
            if( y2 > screen.internal_height - 1 ){ y2 = screen.internal_height - 1 }
            // surface draw
            if( parent_sector.surface.state === 1 ){
                for( let y = parent_sector.surface.points[ x ]; y < y1; y++ ){ screen.draw_pixel( x, y, parent_sector.bottom_color ) }
            }else if( parent_sector.surface.state === 2 ){
                for( let y = y2; y < parent_sector.surface.points[ x ]; y++ ){ screen.draw_pixel( x, y, parent_sector.top_color ) }
            }
            for( let y = y1; y < y2; y++ ){ screen.draw_pixel( x, y, this.color ) }
        }

    }
}
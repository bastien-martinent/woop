class Math3d{
    constructor() {
        this.lookup_table = { cos: [], sin: [], }
        for( let x = 0; x < 360; x++ ){
            this.lookup_table.cos[ x ] = Math.cos( x * Math.PI / 180 )
            this.lookup_table.sin[ x ] = Math.sin( x * Math.PI / 180 )
        }
    }
    get_distance( point_1, point_2 ){
        return Math.round( Math.sqrt( Math.pow( point_2.x-point_1.x, 2 ) + Math.pow( ( point_2.y-point_1.y ), 2 ) ) )
    }
    clip_behind_player( vector1, vector2 ){
        let distance_a = vector1.y
        let distance_b = vector2.y
        let distance  = distance_a - distance_b
        if( distance === 0 ){ distance = 1 }
        let s = distance_a / ( distance_a - distance_b )
        vector1.x = vector1.x + s * ( vector2.x - vector1.x )
        vector1.y = vector1.y + s * ( vector2.y - vector1.y )
        if( vector1.y === 0 ){ vector1.y = 1 }
        vector1.z = vector1.z + s * ( vector1.y - vector1.z )
    }
    angle_range( angle, min_angle = 0 , max_angle = 360, loop = true ){
        if( loop ){
            if( angle > max_angle ){ angle -= max_angle }
            if( angle < min_angle ){ angle += max_angle }
        }else{
            if( angle > max_angle ){ angle = max_angle }
            if( angle < min_angle ){ angle = min_angle }
        }
        return angle
    }
    confine( point, min, max ){
        return Math.min( Math.max( point, min ), max )
    }
}

class Screen{
    constructor( canvas, context, pixel_scale = 8 ){
        this.canvas      = canvas
        this.context     = context
        this.pixel_scale = pixel_scale
        this.colors      = [
            { name : "Yellow",        value : [ 255, 255, 0, 1 ] },
            { name : "Yellow darker", value : [ 160, 160, 0, 1 ] },
            { name : "Green",         value : [ 0, 255, 0, 1 ] },
            { name : "Green darker",  value : [ 0, 160, 0, 1 ] },
            { name : "Cyan",          value : [ 0, 255, 255, 1 ] },
            { name : "Cyan darker",   value : [ 0, 160, 160, 1 ] },
            { name : "Brown",         value : [ 160, 100, 0, 1 ] },
            { name : "Brown darker",  value : [ 110, 50,  0, 1 ] },
            { name : "background",    value : [ 0, 60,  130, 1 ] },
        ]
        this.resize( this.canvas.width, this.canvas.height )
    }
    resize( width, height ){
        this.canvas.width      = width
        this.canvas.height     = height
        this.internal_width    = Math.round( width / this.pixel_scale )
        this.internal_height   = Math.round( height / this.pixel_scale )
        this.internal_width_2  = this.internal_width / 2
        this.internal_height_2 = this.internal_height / 2
    }
    clear_background( color = [ 0, 60,  130, 1 ] ){
        this.context.fillStyle = "rgba("+color[ 0 ]+","+color[ 1 ]+","+color[ 2 ]+","+color[ 3 ]+")"
        this.context.fillRect( 0, 0, this.canvas.width, this.canvas.height )
    }
    draw_pixel( x, y, c ){
        let rgba  = ( typeof this.colors[ c ] !== "undefined" ) ? this.colors[ c ].value : [ 255, 255, 0, 1 ]
        this.context.fillStyle = "rgba("+rgba[ 0 ]+","+rgba[ 1 ]+","+rgba[ 2 ]+","+rgba[ 3 ]+")"
        this.context.fillRect( x * this.pixel_scale, y * this.pixel_scale, this.pixel_scale, this.pixel_scale )
    }
}

class Player{

}

class Camera{

}

class Sector{
    constructor( edges, bottom_z = 0, top_z = 40, bottom_color = 1, top_color = 1 ){
        this.edges         = edges
        this.bottom_z      = bottom_z
        this.top_z         = top_z
        this.bottom_color  = bottom_color
        this.top_color     = top_color
        this.surface       = {
            state  : 0,
            points : [],
        }
        this.distance      = 0
    }
    find_surface_state( camera_z ){
        this.surface.state = ( this.bottom_z < camera_z ) ? ( this.top_z > camera_z ) ? 0 : 2 : 1
    }
    draw_sector( camera, screen ){
        this.distance              = 0 // clear distance
        this.surface.points.length = 0 // clear points
        this.find_surface_state( camera.z_position )
        for( let edge_index = 0; edge_index < this.edges.length; edge_index++ ){
            this.edges[ edge_index ].collect_points( this, camera, screen )
        }
        for( let edge_index = 0; edge_index < this.edges.length; edge_index++ ){
            this.edges[ edge_index ].draw_edge( this, camera, screen )
        }
        this.distance /= this.edges.length //find average sector distance ???
    }
}

class Edge {
    constructor( x1, y1, x2, y2, color = 0, facing = 0 ){
        this.distance = 0
        this.facing   = 0
        this.points   = [
            new IntPoint( x1, y1 ),
            new IntPoint( x2, y2 ),
        ]
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
        let vertex_1 = new IntVertex(
            point_1.x * math_3d.lookup_table.cos[ camera.look_horizontal ] - point_1.y * math_3d.lookup_table.sin[ camera.look_horizontal ],
            tmp,
            parent_sector.bottom_z - camera.z_position + ((camera.look_vertical * tmp) / 32)
        )
        tmp = point_2.y * math_3d.lookup_table.cos[camera.look_horizontal] + point_2.x * math_3d.lookup_table.sin[ camera.look_horizontal ]
        let vertex_2 = new IntVertex(
            point_2.x * math_3d.lookup_table.cos[camera.look_horizontal] - point_2.y * math_3d.lookup_table.sin[ camera.look_horizontal ],
            tmp,
            parent_sector.bottom_z - camera.z_position + ( ( camera.look_vertical * tmp ) / 32 )
        )
        let vertex_3 = new IntVertex( vertex_1.x, vertex_1.y, vertex_1.z + parent_sector.top_z )
        let vertex_4 = new IntVertex( vertex_2.x, vertex_2.y, vertex_2.z + parent_sector.top_z )

        // set distance before screen transformation
        if( update_distance ){
            this.distance = math_3d.get_distance(
                new IntPoint( 0, 0 ),
                new IntPoint( ( vertex_1.x + vertex_2.x ) / 2, ( vertex_1.y + vertex_1.y ) / 2 )
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
        let bottom_point_1 = new IntPoint( this.points[ 1 - this.facing ].x - camera.x_position, this.points[ 1 - this.facing ].y - camera.y_position )
        let bottom_point_2 = new IntPoint( this.points[ 0 + this.facing ].x - camera.x_position, this.points[ 0 + this.facing ].y - camera.y_position )
        let vertices       = this.points_to_vertices( parent_sector, camera, screen, bottom_point_1, bottom_point_2, false )

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
        let bottom_point_1 = new IntPoint( this.points[ 0 + this.facing ].x - camera.x_position, this.points[ 0 + this.facing ].y - camera.y_position )
        let bottom_point_2 = new IntPoint( this.points[ 1 - this.facing ].x - camera.x_position, this.points[ 1 - this.facing ].y - camera.y_position )
        let vertices = this.points_to_vertices( parent_sector, camera, screen, bottom_point_1, bottom_point_2 )

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



class IntPoint{
    constructor( x, y ){
        this.x = Math.round( x )
        this.y = Math.round( y )
    }
    set_x( x ){ this.x = Math.round( x ) }
    set_y( y ){ this.y = Math.round( y ) }
    //todo get distance from this
}

class IntVertex{
    constructor( x, y, z ){
        this.x = Math.round( x )
        this.y = Math.round( y )
        this.z = Math.round( z )
    }
    set_x( x ){ this.x = Math.round( x ) }
    set_y( y ){ this.y = Math.round( y ) }
    set_z( z ){ this.x = Math.round( z ) }
    //todo get distance from this
}

const math_3d = new Math3d()

window.onload = ()=>{

    const GAME_STATES = {
        MENU   : 0,
        GAME   : 1,
        EDITOR : 2,
    }
    const CURSORS = {
        ARROW : 0,
        GRAB  : 1,
    }

    // canvas stuff
    let canvas     = document.getElementById("mood")
    let context_2d = canvas.getContext( "2d" )
    let screen     = new Screen( canvas, context_2d, 8 )

    //debug stuff
    let debug          = true
    let game_state     = GAME_STATES.GAME
    let map_context_2d = null

    // frame rule
    let time = {
        execution_start   : window.performance.now(),
        target_frame_rate : 60,
        unscaledTime      : 0,
        unscaledDeltaTime : 0,
        timeScale         : 1,
        time              : 0,
        deltaTime         : 0,
        maximumDeltaTime  : 0.3333333,
        frame_count       : 0,
        last_frame_count  : 0,
        last_second       : 0,
    }

    let keys = {
        keys_press        : {
            keys_up : new Set(),
            keys_down : new Set(),
        },
        mouse_press       : {
            buttons_up   : new Set(),
            buttons_down : new Set(),
        },
        keys_map          : {
            editor_mode  : [ 9 ],
            game_mode    : [ 9 ],
            escape       : [ 27 ],
            enter        : [ 13 ],
            forward      : [ 87 ],
            backward     : [ 83 ],
            strafe_left  : [ 65 ],
            strafe_right : [ 68 ],
            look_left    : [ 16, 65 ],
            look_right   : [ 16, 68 ],
            look_up      : [ 16, 87 ],
            look_down    : [ 16, 83 ],
            up           : [ 81 ],
            down         : [ 69 ],
        },
        mouse_buttons_map : {
            editor_grab : [ 0 ],
        },
        mouse_lock        : false,
        mouse_movements   : {
            x : 0,
            y : 0,
        },

        resolve_keys : () => {
            //resolve mapped keys press
            Object.keys( keys.keys_map ).forEach( key => {
                let key_down = true
                let key_up   = true
                keys.keys_map[ key ].forEach( ( k ) => { if( ! keys.keys_press.keys_down.has( k ) ){ key_down = false } } )
                keys.keys_map[ key ].forEach( ( k ) => { if( ! keys.keys_press.keys_up.has( k ) ){ key_up = false } } )
                if( key_down ){ keys.keys_status.add( key+"_down" ) }else{ keys.keys_status.delete( key+"_down" ) }
                if( key_up ){ keys.keys_status.add( key+"_release" ) }else{ keys.keys_status.delete( key+"_release" ) }
            })
            Object.keys( keys.mouse_buttons_map ).forEach( button => {
                let key_down = true
                let key_up   = true
                keys.mouse_buttons_map[ button ].forEach( ( k ) => { if( ! keys.mouse_press.buttons_down.has( k ) ){ key_down = false } } )
                keys.mouse_buttons_map[ button ].forEach( ( k ) => { if( ! keys.mouse_press.buttons_up.has( k ) ){ key_up = false } } )
                if( key_down ){ keys.keys_status.add( button+"_down" ) }else{ keys.keys_status.delete( button+"_down" ) }
                if( key_up ){ keys.keys_status.add( button+"_release" ) }else{ keys.keys_status.delete( button+"_release" ) }
            })
            keys.keys_press.keys_up.clear()
            keys.mouse_press.buttons_up.clear()
            keys.mouse_lock = ( document.pointerLockElement === canvas )
        },
        clear_mouse_movements  : () => {
            keys.mouse_movements.x = 0
            keys.mouse_movements.y = 0
        },
        update_mouse_movements : ( event ) => {
            console.log( event )
            keys.mouse_buttons     = event.buttons
            keys.mouse_movements.x += event.movementX
            keys.mouse_movements.y += event.movementY
        },
        update_mouse_click_up : ( event ) => {
            keys.mouse_press.buttons_up.add( event.button )
            keys.mouse_press.buttons_down.delete( event.button )
        },
        update_mouse_click_down : ( event ) => {
            keys.mouse_press.buttons_up.delete( event.button )
            keys.mouse_press.buttons_down.add( event.button )
        },
        keys_status : new Set(),
    }
    let player = {
        x_position      : 220,
        y_position      : 340,
        z_position      : 20,
        look_horizontal : 0,
        look_vertical   : 0,
    }

    let editor = {
        unit      : 10,
        grid_pos  : new IntPoint( 0, 0 ),
        grid_size : 10*2,
        cursor    : {
            position : new IntPoint( screen.canvas.width / 2, screen.canvas.height / 2 ),
        }
    }

    let level = {
        size_x  : 7500,
        size_y  : 5000,
        size_z  : 100,
        sectors : [
            new Sector(
                [
                    new Edge( 0, 0, 32, 0, 2 ),
                    new Edge( 32, 0, 32, 32, 1 ),
                    new Edge( 32, 32, 0, 32, 2 ),
                    new Edge( 0, 32, 0, 0, 1 ),
                ]
            ),
            new Sector(
                [
                    new Edge( 64, 0, 96, 0, 4 ),
                    new Edge( 96, 0, 96, 32, 3 ),
                    new Edge( 96, 32, 64, 32, 4 ),
                    new Edge( 64, 32, 64, 0, 3 ),
                ]
            ),
            new Sector(
                [
                    new Edge( 64, 64, 96, 64, 5 ),
                    new Edge( 96, 64, 96, 96, 6 ),
                    new Edge( 96, 96, 64, 96, 5 ),
                    new Edge( 64, 96, 64, 64, 6 ),
                ]
            ),
            new Sector(
                [
                    new Edge( 0, 64, 32, 64, 7 ),
                    new Edge( 32, 64, 32, 96, 0 ),
                    new Edge( 32, 96, 0, 96, 7 ),
                    new Edge( 0, 96, 0, 64, 0 ),
                ]
            )
        ]
    }

    const resize_canvas = () => {
        screen.resize( window.visualViewport.width, window.visualViewport.height )
    }

    const main_loop = () => {
        const slice     = ( 1 / time.target_frame_rate ) - 0.005
        let accumulator = ( performance.now() / 1000 ) - time.unscaledTime

        while( accumulator >= slice ){
            time.unscaledDeltaTime = ( performance.now() / 1000 ) - time.unscaledTime
            time.unscaledTime += time.unscaledDeltaTime
            let deltaT = time.unscaledDeltaTime
            if( deltaT > time.maximumDeltaTime ){
                deltaT = time.maximumDeltaTime
            }
            time.deltaTime = deltaT * time.timeScale
            time.time += time.deltaTime

            keys.resolve_keys()
            update_game_state()
            update_movements( game_state )

            accumulator -= slice
        }

        render( game_state )

        if( debug ){ update_debug() }

        let current_second = Math.floor( performance.now() / 1000 )
        time.frame_count++

        if( time.last_second < current_second ){
            time.last_second       = current_second
            time.last_frame_count = time.frame_count
            time.frame_count      = 0
        }

        requestAnimationFrame( main_loop )
    }

    const update_game_state = () => {
        switch ( game_state ){
            case GAME_STATES.GAME :
                if( keys.keys_status.has( "editor_mode_release" ) ){ game_state = GAME_STATES.EDITOR }
                break
            case GAME_STATES.EDITOR :
                if( keys.keys_status.has( "game_mode_release" ) ){ game_state = GAME_STATES.GAME }
                break
        }
    }

    const update_movements = ( state ) => {
        switch ( state ){
            case GAME_STATES.GAME :
                update_game_movements()
                break
            case GAME_STATES.EDITOR :
                update_editor_movements()
                break
        }
    }

    const update_editor_movements = () => {
        editor.cursor.position.set_x( math_3d.confine( ( editor.cursor.position.x + keys.mouse_movements.x ), 0, screen.canvas.width ) )
        editor.cursor.position.set_y( math_3d.confine( ( editor.cursor.position.y + keys.mouse_movements.y ), 0, screen.canvas.height ) )
        keys.clear_mouse_movements()
    }

    const update_game_movements = () => {
        if( keys.mouse_lock ){
            player.look_horizontal += Math.round( keys.mouse_movements.x / 8 )
        }else{
            if( keys.keys_status.has( "look_left_down" ) ){ player.look_horizontal  -= 2 }
            if( keys.keys_status.has( "look_right_down" ) ){ player.look_horizontal += 2 }
        }
        player.look_horizontal = math_3d.angle_range( player.look_horizontal )

        let delta_x = Math.round( math_3d.lookup_table.sin[ player.look_horizontal ] * 6.0 )
        let delta_y = Math.round( math_3d.lookup_table.cos[ player.look_horizontal ] * 6.0 )

        if( keys.mouse_lock ){
            player.look_vertical -= Math.round( keys.mouse_movements.y / 16 )
        }else{
            if( keys.keys_status.has( "look_up_down" )  ){ player.look_vertical -= 1 }
            if( keys.keys_status.has( "look_down_down" )  ){ player.look_vertical  += 1 }
        }
        player.look_vertical = math_3d.angle_range( player.look_vertical, -90, 90, false )

        if(
            keys.keys_status.has( "forward_down" )
            && ! keys.keys_status.has( "look_up_down" )
        ){
            player.x_position += delta_x
            player.y_position += delta_y
        }
        if(
            keys.keys_status.has( "backward_down" )
            && ! keys.keys_status.has( "look_down_down" )
        ){
            player.x_position -= delta_x
            player.y_position -= delta_y
        }
        if(
            keys.keys_status.has( "strafe_right_down" )
            && ! keys.keys_status.has( "look_right_down" )
        ){
            player.x_position += delta_y
            player.y_position -= delta_x
        }
        if(
            keys.keys_status.has( "strafe_left_down" )
            && ! keys.keys_status.has( "look_left_down" )
        ){
            player.x_position -= delta_y
            player.y_position += delta_x
        }
        if( keys.keys_status.has( "up_down" ) ){ player.z_position += 4 }
        if( keys.keys_status.has( "down_down" ) ){ player.z_position -= 4 }

        if( player.x_position < 0 ){ player.x_position = 0 }
        if( player.y_position < 0 ){ player.y_position = 0 }
        if( player.x_position > level.size_x ){ player.x_position = level.size_x }
        if( player.y_position > level.size_y ){ player.y_position = level.size_y }
        keys.clear_mouse_movements()
    }

    const render = () => {
        switch ( game_state ){
            case 0 :
                break
            case 1 :
                render_game()
                break
            case 2 :
                render_editor()
                break
        }
    }

    const render_game = () => {
        screen.clear_background()
        // sort sector by distance
        for( let i = 0; i < level.sectors.length - 1 ; i++ ){
            for( let i2 = 0; i2 < level.sectors.length - i - 1; i2++ ){
                if( level.sectors[ i2 ].distance < level.sectors[ i2+1 ].distance ){
                    let swap              = level.sectors[ i2 ]
                    level.sectors[ i2 ]   = level.sectors[ i2+1 ]
                    level.sectors[ i2+1 ] = swap
                }
            }
        }

        // draw sector
        for( let sector_index = 0; sector_index < level.sectors.length; sector_index++ ){
            level.sectors[ sector_index ].draw_sector( player, screen )
        }
    }

    const render_editor = () => {
        screen.clear_background( [ 0, 0, 0, 1 ] )
        screen.context.strokeStyle = "rgba( 120, 120, 120, 1 )"
        screen.context.lineWidth  = 1
        let cursor_state = 0
        let step_x = Math.round( screen.canvas.width / editor.grid_size ) + 1
        let step_y = Math.round( screen.canvas.height / editor.grid_size ) + 1
        for( let x = editor.grid_pos.x; x <= step_x; x++ ){
            screen.context.moveTo( x * editor.grid_size, 0 )
            screen.context.lineTo( x * editor.grid_size, screen.canvas.height )
        }
        for( let y = editor.grid_pos.y; y <= step_y; y++ ){
            screen.context.moveTo( 0, y * editor.grid_size )
            screen.context.lineTo( screen.canvas.width, y * editor.grid_size )
        }
        screen.context.stroke()
        if( keys.keys_status.has( 'editor_grab_down' ) ){ cursor_state = 1 }
        draw_cursor( cursor_state, editor.cursor.position.x, editor.cursor.position.y )
    }

    const draw_cursor = ( state, x, y ) => {
        screen.context.strokeStyle = "rgb( 255, 255, 255, 1 )"
        screen.context.fillStyle   = "rgb( 255, 255, 255, 1 )"
        screen.context.beginPath()
        switch( state ){
            case CURSORS.GRAB :
                screen.context.moveTo( x, y - 8 )
                screen.context.lineTo( x , y + 8 )
                screen.context.moveTo( x- 8, y )
                screen.context.lineTo (x + 8, y )
                break
            default :
                screen.context.moveTo( x, y )
                screen.context.lineTo( x + 16, y + 6 )
                screen.context.lineTo (x + 6, y + 16 )
                break
        }
        screen.context.stroke()
        screen.context.fill()
    }

    const init_debug = () => {
        let pre = document.createElement("pre" )
        pre.style.position        = "absolute"
        pre.style.display         = "block"
        pre.style.top             = "50px"
        pre.style.right           = "50px"
        pre.style.backgroundColor = "#ffffffff"
        pre.style.margin          = "0px"
        pre.style.padding         = "10px"
        pre.innerHTML             += "Fps : <span id='frame_rate'></span><br>"
        pre.innerHTML             += "Game state : <span id='game_state'></span><br>"
        pre.innerHTML             += "viewport resolution : <span id='vp_res'></span><br>"
        pre.innerHTML             += "Internal resolution : <span id='int_res'></span><br>"
        pre.innerHTML             += "Pixel scale : <span id='p_scale'>"+screen.pixel_scale+"X</span><br>"

        pre.innerHTML += "Keys press : <span id='keys'></span><br>"
        pre.innerHTML += "Mouse position : <span id='mouse'></span><br>"
        pre.innerHTML += "Cursor position : <span id='cursor'></span><br>"


        let ratio = Math.min(200 / level.size_x, 200 / level.size_y );
        let map_display_x = Math.round( level.size_x * ratio )
        let map_display_y = Math.round( level.size_y * ratio )
        pre.innerHTML += "<canvas id='map' width='"+map_display_x+"' height='"+map_display_y+"'></canvas>"
        pre.innerHTML += "Player position : <br><span id='p_pos'></span><br><span id='p_ang'></span><br>"
        document.body.append( pre )
        map_context_2d = document.getElementById( "map" ).getContext( "2d" )
        map_context_2d.strokeRect(0, 0, map_display_x, map_display_y )
    }

    const update_debug = () => {
        document.getElementById("game_state").innerHTML = game_state
        document.getElementById("vp_res").innerHTML = "y-" + screen.canvas.width + " x-" + screen.canvas.height
        document.getElementById("int_res").innerHTML = "y-" + screen.internal_width + " x-" + screen.internal_height
        document.getElementById("frame_rate").innerHTML = time.last_frame_count
        document.getElementById("keys").innerHTML = JSON.stringify( Array.from( keys.keys_status ).join(" ,<br>") )
        document.getElementById("mouse").innerHTML =  "mouse "+( ( keys.mouse_lock ) ? "lock " : "unlock " )+"x-"+keys.mouse_movements.x+" y-"+keys.mouse_movements.y
        document.getElementById("cursor").innerHTML =  "x-"+editor.cursor.position.x+" y-"+editor.cursor.position.y
        document.getElementById("p_pos").innerHTML = "x-"+player.x_position+" y-"+player.y_position+" z-"+player.z_position
        document.getElementById("p_ang").innerHTML = "h_angle-"+player.look_horizontal+" v_angle-"+player.look_vertical
        let ratio = Math.min( 200 / level.size_x, 200 / level.size_y );
        let map_display_x = Math.round( level.size_x * ratio )
        let map_display_y = Math.round( level.size_y * ratio )
        let x1            = Math.round( player.x_position / level.size_x * map_display_x )
        let y1            = Math.round( ( level.size_y - player.y_position ) / level.size_y * map_display_y )
        let map_look      = math_3d.angle_range( player.look_horizontal - 90 )
        let x2            = Math.round( x1 + 10 * math_3d.lookup_table.cos[ map_look ]  )
        let y2            = Math.round( y1 + 10 * math_3d.lookup_table.sin[ map_look ] )

        // clear map
        map_context_2d.fillStyle = "rgba( 0, 0, 0 , 0)"
        map_context_2d.strokeStyle = "rgba( 0, 0, 0 , 1)"
        map_context_2d.clearRect(1, 1, map_display_x - 2, map_display_y - 2 )
        map_context_2d.strokeRect(0, 0, map_display_x, map_display_y )
        // wall
        for( let sector_index = 0; sector_index < level.sectors.length; sector_index++ ){
            for( let edge_index = 0; edge_index < level.sectors[ sector_index ].edges.length; edge_index++ ){
                let wall_x1 = Math.round( ( level.sectors[ sector_index ].edges[ edge_index ].points[ 0 ].x ) * ratio )
                let wall_y1 = Math.round( ( level.size_y - level.sectors[ sector_index ].edges[ edge_index ].points[ 0 ].y ) * ratio )
                let wall_x2 = Math.round( ( level.sectors[ sector_index ].edges[ edge_index ].points[ 1 ].x ) * ratio )
                let wall_y2 = Math.round( ( level.size_y - level.sectors[ sector_index ].edges[ edge_index ].points[ 1 ].y ) * ratio )
                map_context_2d.beginPath()
                map_context_2d.strokeStyle = "rgba( 245, 40, 145 , 1)"
                map_context_2d.moveTo( wall_x1, wall_y1 )
                map_context_2d.lineTo( wall_x2, wall_y2 )
                map_context_2d.stroke()
            }
        }
        // player pos
        map_context_2d.beginPath();
        map_context_2d.fillStyle = "rgba( 245, 40, 145 , 1)"
        map_context_2d.arc( x1, y1, 2, 0, 2 * Math.PI, false )
        map_context_2d.fill();
        // arrow
        map_context_2d.fillStyle = "rgba( 0, 0, 0 , 0)"
        map_context_2d.strokeStyle = "rgba( 40, 40, 40 , 1)"
        map_context_2d.beginPath();
        map_context_2d.moveTo( x1, y1 );
        map_context_2d.lineTo( x2, y2 );
        map_context_2d.stroke();

    }

    //windows events
    window.addEventListener('resize', resize_canvas )
    window.addEventListener("keyup", ( event ) => {
        event.preventDefault()
        keys.keys_press.keys_up.add( event.keyCode )
        keys.keys_press.keys_down.delete( event.keyCode )
    } )
    window.addEventListener("keydown", ( event ) => {
        event.preventDefault()
        keys.keys_press.keys_down.add( event.keyCode )
        keys.keys_press.keys_up.delete( event.keyCode )
    } )
    document.addEventListener("pointerlockchange", () => {
        if( document.pointerLockElement ){
            document.addEventListener("mousemove", keys.update_mouse_movements, false )
            document.addEventListener("mouseup", keys.update_mouse_click_up, false )
            document.addEventListener("mousedown", keys.update_mouse_click_down, false )
        }else{
            document.removeEventListener("mousemove", keys.update_mouse_movements, false )
            document.removeEventListener("mouseup", keys.update_mouse_click_up, false )
            document.removeEventListener("mousedown", keys.update_mouse_click_down, false )
        }
    } )
    canvas.addEventListener( "click", async () => {
        if( ! document.pointerLockElement ){
            await canvas.requestPointerLock( { unadjustedMovement: true } )
        }
    }, false )

    resize_canvas()
    if( debug ){ init_debug() }
    window.requestAnimationFrame( main_loop )
}
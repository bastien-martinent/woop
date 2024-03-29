import { GAME_STATES } from "./const.js"
import WadLoader       from "./WadLoader.js"
import Level           from "./Level.js"
import Renderer2D      from "./Renderer2D.js"
import Game            from "./Game.js"
import Editor          from "./Editor.js"
import Debugger        from "./Debugger.js"
import InputManager    from "./InputManager.js"

export default class Woop{
    constructor( canvas, options = {} ){
        let render_mode   = ( options.render !== undefined ) ? options.render : '2D'
        let pixel_scale   = ( options.scale !== undefined ) ? options.scale : 8
        let field_of_view = ( options.field_of_view !== undefined ) ? options.field_of_view : 90
        let player_height = ( options.player_height !== undefined ) ? options.player_height : 45
        let frame_rate    = ( options.frame_rate !== undefined ) ? options.frame_rate       : 30
        let debug         = ( options.debug !== undefined ) ? options.debug : false

        switch ( render_mode ){
            case '2D' :
            default :
                this.renderer     = new Renderer2D( this, canvas, field_of_view, pixel_scale, frame_rate )
        }

        this.game_state        = GAME_STATES.EDITOR
        this.debbuger          = new Debugger( this, debug )
        this.wad_loader        = new WadLoader( this,[ './wads/DOOM1.WAD' ] )

        this.level             = new Level( this )
        this.level.load_from_wad( this.wad_loader, 'E1M1' )
        this.player            = this.level.spawn_player( player_height )

        this.inputs            = new InputManager( this )
        this.game              = new Game( this )
        this.editor            = new Editor( this )
        this.time = {
            target_frame_rate : frame_rate,
            execution_start   : window.performance.now(),
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
    }

    run(){
        this.woop_loop()
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    woop_loop = () => {
        let slice          = ( 1 / this.time.target_frame_rate ) - 0.005
        let accumulator    = ( performance.now() / 1000 ) - this.time.unscaledTime
        let current_second = Math.floor( performance.now() / 1000 )

        while( accumulator >= slice ){
            this.time.unscaledDeltaTime = ( performance.now() / 1000 ) - this.time.unscaledTime
            this.time.unscaledTime      += this.time.unscaledDeltaTime
            let deltaT = this.time.unscaledDeltaTime
            if( deltaT > this.time.maximumDeltaTime ){ deltaT = this.time.maximumDeltaTime }
            this.time.deltaTime = deltaT * this.time.timeScale
            this.time.time      += this.time.deltaTime

            this.update()
            this.debbuger.update()

            accumulator -= slice

        }

        this.render()
        this.debbuger.render()
        this.time.frame_count++

        if( this.time.last_second < current_second ){
            this.time.last_second       = current_second
            this.time.last_frame_count = this.time.frame_count
            this.time.frame_count      = 0
        }

        requestAnimationFrame( () => { this.woop_loop() }  )
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    update = () =>{
        this.inputs.resolve_keys()

        switch ( this.game_state ){
            case GAME_STATES.GAME :
                if( this.inputs.input_status.has( "editor_mode_release" ) ){
                    this.game_state = GAME_STATES.EDITOR
                }
                break
            case GAME_STATES.EDITOR :
                if( this.inputs.input_status.has( "game_mode_release" ) ){
                    this.game_state = GAME_STATES.GAME
                }
                break
        }

        switch ( this.game_state ){
            case GAME_STATES.GAME :
                this.game.update()
                break
            case GAME_STATES.EDITOR :
                this.editor.update()
                break
        }

        this.inputs.clear_mouse_movements()
    }

    render = () =>{
        switch ( this.game_state ){
            case GAME_STATES.GAME :
                this.game.render( this.renderer )
                break
            case GAME_STATES.EDITOR :
                this.editor.render( this.renderer )
                break
        }
    }
}

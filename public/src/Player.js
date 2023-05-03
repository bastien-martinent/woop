export default class Player{
    constructor( position, horizontal_angle = 0, vertical_angle ){
        this.position        = position
        this.look_horizontal = horizontal_angle
        this.look_vertical   = vertical_angle
    }

}
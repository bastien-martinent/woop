export default class Player{
    constructor( position, horizontal_angle = 0, vertical_angle, height ){
        this.position         = position
        this.horizontal_angle = horizontal_angle
        this.vertical_angle   = vertical_angle
        this.height           = height
        this.floor_hight      = 0
    }

}
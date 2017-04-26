var Chip8 = require('./chip8')
var Renderer = require('./renderer')
var game = false
var renderer = new Renderer()
var chip8 = new Chip8()

function start() {
    renderer.setupCanvas()
    renderer.setupInput()
    
    chip8.init()
    chip8.load(file)
} 

function loop() {
    while(game) {
        chip8.cycle()
        
        if (chip8.drawFlag) {
            draw()
        }
        
        chip8.setKeys()
    }
}

function setupCanvas() {
    
}

function setupInput() {
    
}
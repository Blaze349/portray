var Chip8 = require('./chip8')
var game = false

var chip8 = new Chip8()

function start() {
    setupCanvas()
    setupInput()
    
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
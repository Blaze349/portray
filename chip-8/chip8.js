class Chip8 {
    constructor() {
        
    }
    
    init() {
        //the 16 registers
        this.V = new Array(16)

        //the virtual ram
        this.memory = new Array(4096)
        
        //for subroutines
        this.stack = new Array(16)
        
        //this points to the parent func
        this.stackPointer = 0
        
        //this is the special address register
        
        this.I = 0
        
        //the timers are initially set to zero
        this.delayTimer = 0
        this.soundTimer = 0
        
        //this is the program counter
        this.pc = 0
        
    }
}

module.exports = Chip8
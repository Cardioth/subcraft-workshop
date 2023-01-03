'use strict'

import * as workshopInterface  from './workshopinterface/workshopinterface.js';

const config = {
    width: 1000,
    height: 700,
    type: Phaser.AUTO,
    scene: {
        preload:preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload()
{  
    workshopInterface.loadWorkshopInterfaceAssets(this);
}

function create ()
{
    workshopInterface.createWorkshopInterface(this);
}

function update (){
    workshopInterface.interfaceMovement();
}
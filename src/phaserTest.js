'use strict'

var config = {
    width: 1250,
    height: 850,
    type: Phaser.AUTO,
    scene: {
        preload:preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var scene;

var partsList = [];

var shopInterface;
var buildInterface;
var pointerOnShop;
var workshopInterfaceX = 600;
var workshopInterfaceY = 400;
var totalPartsListWidth;

var buildNodes = [
    //Root node
    {
    engaged: false, x: -22.75, y: -102.5, accepts: [
        {part:'middle_hull',x:0,y:0}, 
        {part:'front_hull',x:0,y:0}, 
        {part:'back_hull',x:0,y:0}],
    },
];

var nodeStructure = {
    front_hull:{
        engaged:false, x:200, y:200, accepts: [
            {part:'middle_hull',x:0,y:0},
            {part:'window',x:0,y:0}
        ], 
    },
    middle_hull:{
        engaged:false, x:200, y:200, accepts: [
            {part:'front_hull',x:0,y:0},
            {part:'back_hull',x:0,y:0}
        ], 
    },
    back_hull:{
        engaged:false, x:200, y:200, accepts: [
            {part:'middle_hull',x:0,y:0},
            {part:'window',x:0,y:0}
        ], 
    },
}

function preload()
{  
    this.load.plugin('rexhorrifipipelineplugin', 'src/rexhorrifipipelineplugin.min.js', true);      
    this.load.plugin('rextoonifypipelineplugin', 'src/rextoonifypipelineplugin.min.js', true);   
    this.load.multiatlas('interface', 'assets/interface.json', 'assets');
    this.load.multiatlas('submarine', 'assets/submarineCentreAnchors.json', 'assets');
}

function create ()
{
    scene = this;
    this.input.topOnly = false;
    var workshopInterface = this.add.container(workshopInterfaceX,workshopInterfaceY);

    var workshopInterfaceBackground = this.add.image(0,0,'interface','workshopInterface.png');
    var saveButtonUp = this.add.image(62,134,'interface','saveButtonUp.png').setInteractive();
    var saveButtonOver = this.add.image(62,134,'interface','saveButtonOver.png').setInteractive();
    var launchButtonUp = this.add.image(132,134,'interface','launchButtonUp.png').setInteractive();
    var launchButtonOver = this.add.image(132,134,'interface','launchButtonOver.png').setInteractive();

    workshopInterface.add(workshopInterfaceBackground);
    workshopInterface.add(saveButtonUp);
    workshopInterface.add(saveButtonOver);
    saveButtonOver.setVisible(false);
    workshopInterface.add(launchButtonUp);
    workshopInterface.add(launchButtonOver);
    launchButtonOver.setVisible(false);

    saveButtonUp.on('pointerover', function () {
        saveButtonUp.setVisible(false);
        saveButtonOver.setVisible(true);
        document.body.style.cursor = 'pointer';
    });

    saveButtonOver.on('pointerout', function () {
        saveButtonUp.setVisible(true);
        saveButtonOver.setVisible(false);
        document.body.style.cursor = 'default';
    });

    saveButtonOver.on('pointerdown', function () {
        saveButtonUp.setVisible(true);
        saveButtonOver.setVisible(false);
    });

    launchButtonUp.on('pointerover', function () {
        launchButtonUp.setVisible(false);
        launchButtonOver.setVisible(true);
        document.body.style.cursor = 'pointer';
    });

    launchButtonOver.on('pointerout', function () {
        launchButtonUp.setVisible(true);
        launchButtonOver.setVisible(false);
        document.body.style.cursor = 'default';
    });
    launchButtonOver.on('pointerdown', function () {
        launchButtonUp.setVisible(true);
        launchButtonOver.setVisible(false);
    });

    //Shop Interface Stuff
    shopInterface = this.add.container(0,0);
    var lowerScreen = this.add.image(-23,53.1,'interface','lowerScreen.png').setInteractive();
    lowerScreen.alpha = 0.1;
    shopInterface.add(lowerScreen);

    this.input.on('pointerup', function(pointer){
        pointerState = 'up';
    });
    this.input.on('pointermove', function (pointer) {
        pointerX = pointer.x;
        pointerY = pointer.y;
    });
    lowerScreen.on('pointerout', function(){
        document.body.style.cursor = 'default';
        pointerOnShop = false;
    });
    lowerScreen.on('pointerover', function () {
        document.body.style.cursor = 'grab';
        pointerOnShop = true;
    });
    lowerScreen.on('pointerdown', function () {
        pointerState = 'down'
    });

    var allParts = ['front_hull','middle_hull','back_hull','flipper','propeller','top_hatch','top_plate','back_armor','frontHardpoint','window','flair1','flair2','miningLaser'];
    for(var parts of allParts){
        createPart(parts, true);
    }

    //How to handle adding a group of parts to shop
    var gun_turret = this.add.image(0,-60,'submarine','gun_turret.png').setInteractive();
    var gun_base = this.add.image(0,0,'submarine','gun_base.png').setInteractive();
    var gun_assembly = this.add.container(0,0,[
        gun_turret,
        gun_base,
    ]);
    gun_assembly.setSize(gun_base.width+50,gun_turret.height+50);
    gun_assembly.setInteractive();
    gun_assembly.partType = 'gun_assembly';
    partsList.push(gun_assembly);

    //Add all the parts to the screen interface
    for(var i=0;i<partsList.length;i++){
        addPartToShopInterface(partsList[i]);
        partsList[i].x = sumOfPreviousPartsWidth(i, partsList, 30)+(partsList[i].width/3/2)-220;
        partsList[i].y = 53.1;
        partsList[i].originalX = partsList[i].x;
    }
    totalPartsListWidth = sumOfPreviousPartsWidth(partsList.length, partsList, 30);

    //Building Sub Screen
    buildInterface = this.add.container();
    var upperScreen = this.add.image(-22.75,-102.5,'interface','upperScreen.png').setInteractive();
    upperScreen.alpha = 0.1;
    buildInterface.add(upperScreen);

    pingGraphic(-22.75,-102.5);
    
    //global positioned cause mask
    var lowerScreenMask = this.add.image(workshopInterfaceX-23.75, workshopInterfaceY+53,'interface','lowerScreen.png');
    workshopInterface.add(lowerScreenMask)
    lowerScreenMask.setVisible(false);
    shopInterface.mask = new Phaser.Display.Masks.BitmapMask(this, lowerScreenMask);
    workshopInterface.add(shopInterface);

    var upperScreenMask = this.add.image(workshopInterfaceX-22.75, workshopInterfaceY-102.5,'interface','upperScreen.png').setInteractive();
    workshopInterface.add(upperScreenMask)
    upperScreenMask.setVisible(false);

    buildInterface.mask = new Phaser.Display.Masks.BitmapMask(this, upperScreenMask);
    workshopInterface.add(buildInterface);
 
    //Parts text above the shop
    var partsPlate = this.add.image(-216,-4,'interface','partsPlate.png');
    workshopInterface.add(partsPlate);

    //Effects
    var postFxPlugin = this.plugins.get('rexhorrifipipelineplugin');
    var postFxPluginToon = this.plugins.get('rextoonifypipelineplugin');

    var postFxPipelineToonLower = postFxPluginToon.add(shopInterface, {
        edgeThreshold: 0.25,
        hueLevels: 2,
        satLevels: 10,
        valLevels: 10,
        edgeColor: 0x98FFBA,
    });

    var postFxPipelineToonUpper = postFxPluginToon.add(buildInterface, {
        edgeThreshold: 0.25,
        hueLevels: 2,
        satLevels: 10,
        valLevels: 10,
        edgeColor: 0x98FFBA,
    });

    var horrifiSettings = {
            enable: true,
            // Bloom
            bloomRadius: 0.08,
            bloomIntensity: 1,
            bloomThreshold: 0.03,
            bloomTexelWidth: 0.05,
            bloomTexelHeight: 0.05,
            // Chromatic abberation
            chabIntensity: .1,
            // Vignette
            vignetteStrength: 0.1,
            vignetteIntensity: 0.1,
            vignetteEnable: false,
            // Noise
            noiseEnable: false,
            noiseStrength: 0.2,
            // VHS
            vhsStrength: 0.2,
            // Scanlines
            scanStrength: 0.3,
            //CRT
            crtWidth: 1,
            crtHeight: 1,
    }
    var postFxPipelineLower = postFxPlugin.add(shopInterface, horrifiSettings);
    var postFxPipelineUpper = postFxPlugin.add(buildInterface, horrifiSettings); 


}

function createPart(partName, addingToShop){
    var part = scene.add.image(0,0,'submarine',partName+'.png').setInteractive(); 
    part.partType = partName;
    if(addingToShop == true){
        partsList.push(part);
    }
    return part;
}

function sumOfPreviousPartsWidth(i,parts, margin){
    var totalWidth = 0;
    for(var j=0;j<i;j++){
        totalWidth += (parts[j].width/3)+margin;
    }
    return totalWidth;
}

function addPartToShopInterface(part){
    part.scale = 0.3;
    part.tarScale = 0.3;
    shopInterface.add(part);

    //Can't set tint on a container so had to do this
    setTintPart(part,0x3B9459);

    part.on('pointerover', function () {
        if(!pointerOnShop){return;}
        setTintPart(part,0x57FF77);
        part.tarScale = 0.39;
        document.body.style.cursor = 'pointer'; 
    });
    part.on('pointerout', function () {
        if(!pointerOnShop){return;}
        setTintPart(part,0x3B9459);
        part.tarScale = 0.3;
        document.body.style.cursor = 'grab';
    });
    part.on('pointerdown', function () {
        if(!pointerOnShop){return;}
        addPartToBuild(part.partType);
        document.body.style.cursor = 'pointer';
    });
    part.on('pointerup', function () {
        if(!pointerOnShop){return;}
        document.body.style.cursor = 'pointer';
    });
}

function setTintPart(part,color){
    if(part.type != 'Container'){
        part.setTint(color);
    } else {
        for(var components of part.list){
            components.setTint(color);
        }
    }
}

function addPartToBuildInterface(part,x,y){
    part.scale = 0.4;
    part.x = x;
    part.y = y;
    buildInterface.add(part);
    setTintPart(part,0x3B9459);

    console.log('buildNodes Before: ' + buildNodes);
    buildNodes.push(nodeStructure[part.partType]);
    console.log('buildNodes After: ' + buildNodes);

}

function addPartToBuild(partType){
    //search buildNodes for a place to put it.
    var foundBuildNodes = [];
    for(var nodes of buildNodes){
        for(var accepts of nodes.accepts){
            if(accepts.part == partType && nodes.engaged == false){
                foundBuildNodes.push({PartType:partType, x:nodes.x,y:nodes.y,node:nodes});
            }
        }
    }
    if(foundBuildNodes.length == 1){
        var buildNode = foundBuildNodes[0];
        addPartToBuildInterface(createPart(buildNode.PartType), buildNode.x, buildNode.y);
    }

    if(foundBuildNodes.length > 1){

    }
}

function pingGraphic(x,y){
    var pingGraphic = scene.add.circle(x,y,5, 0xFF0000);
    pingGraphic.setStrokeStyle(2,0xFF0000);
    buildInterface.add(pingGraphic);
}

var shopScrollTar = 0;
var prevPointerX = 0;
var pointerDelta = 0;
var pointerState;
var pointerX;
var pointerY;

function update ()
{
    for(var i=0;i<partsList.length;i++){6
        partsList[i].x -= (partsList[i].x - (shopScrollTar+partsList[i].originalX))/28;
        partsList[i].scale -= (partsList[i].scale - partsList[i].tarScale)/12;
    }

    pointerDelta = pointerX - prevPointerX;
    if(pointerState == 'down'){
        if(Math.abs(pointerDelta < 10)){
            shopScrollTar += pointerDelta*6;
            if(shopScrollTar<-totalPartsListWidth+300){
                shopScrollTar = -totalPartsListWidth+300;
            }
            if(shopScrollTar>0){
                shopScrollTar = 0;
            }
        }
    }
    prevPointerX = pointerX;
}
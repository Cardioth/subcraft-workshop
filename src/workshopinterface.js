'use strict'

import {nodeStructure} from '/src/nodestructure.js';
import {allSubParts} from '/src/subparts.js';
import {colours} from '/src/colours.js'

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
let scene;

let credits = 1500;
let partsList = [];
let partSelected = null;;

let rootNode;
let shopInterface;
let buildInterface;
let buildScreenText;
let pointerOnShop;
let workshopInterface;
let workshopInterfaceX = config.width/2;
let workshopInterfaceY = config.height/2;
let totalPartsListWidth;

let mouseOverPart = [];
let mouseOverBuildScreen = false;
let mouseOverBuildScreenIcons = false;
let buildScreenFrozen = false;

let allParts = [];
let allPingGraphics = [];

function preload()
{  
    this.load.bitmapFont('MKOCR', 'assets/MKOCR.png', 'assets/MKOCR.xml');
    this.load.bitmapFont('QuirkyRobot', 'assets/QuirkyRobot.png', 'assets/QuirkyRobot.xml');
    this.load.plugin('rexglowfilter2pipelineplugin', 'src/shaders/rexglowfilter2pipelineplugin.min.js', true);
    this.load.plugin('rexkawaseblurpipelineplugin', 'src/shaders/rexkawaseblurpipelineplugin.min.js', true);      
    this.load.plugin('rexhorrifipipelineplugin', 'src/shaders/rexhorrifipipelineplugin.min.js', true);      
    this.load.plugin('rextoonifypipelineplugin', 'src/shaders/rextoonifypipelineplugin.min.js', true);   
    this.load.multiatlas('interface', 'assets/interface.json', 'assets');
    this.load.multiatlas('submarine', 'assets/submarineBluePrint.json', 'assets');
    this.load.audio('click', ['assets/audio/click.ogg','assets/audio/click.mp3']);
    this.load.audio('opening', ['assets/audio/opening.ogg','assets/audio/opening.mp3']);
    this.load.audio('trash', ['assets/audio/trash.ogg','assets/audio/trash.mp3']);
    this.load.audio('hover', ['assets/audio/hover.ogg','assets/audio/hover.mp3']);
}

function create ()
{
    scene = this;
    scene.input.topOnly = false;
    workshopInterface = scene.add.container(workshopInterfaceX,workshopInterfaceY);
    const workshopInterfaceBackground = scene.add.image(0,0,'interface','workshopInterface.png');
    workshopInterface.add(workshopInterfaceBackground);

    const loadButton = scene.add.image(-28,133,'interface','loadButtonUp.png').setInteractive();
    const saveButton = scene.add.image(37.4,133,'interface','saveButtonUp.png').setInteractive();
    const launchButton = scene.add.image(125,133,'interface','launchButtonUp.png').setInteractive();

    workshopInterface.add(loadButton);
    workshopInterface.add(saveButton);
    workshopInterface.add(launchButton);

    loadButton.on('pointerover', () => {
        document.body.style.cursor = 'pointer';
        loadButton.frame = loadButton.texture.frames["loadButtonOver.png"];
    });
    loadButton.on('pointerout', () => {
        document.body.style.cursor = 'default';
        loadButton.frame = loadButton.texture.frames["loadButtonUp.png"];
    });
    loadButton.on('pointerdown', () => {
        if(buildScreenFrozen){return};
        destroySelectRect();
        if(rootNode.list.length !== 0){
            buildScreenFrozen = true;
            dialogueBoxYesCancel(()=>{
                const savedSubJSON = localStorage.getItem('savedSub');
                buildScreenFrozen = false;
                trashSub();
                scene.sound.add('click').play();
                const loadedSub = JSON.parse(savedSubJSON);
                if(Object.keys(loadedSub).length !== 0){
                    loadSub(loadedSub, rootNode);
                }
                mouseOverPart = [];
            },buildInterface,"Are you sure?");
        } else {
            const savedSubJSON = localStorage.getItem('savedSub');
            trashSub();
            scene.sound.add('click').play();
            const loadedSub = JSON.parse(savedSubJSON);
            if(Object.keys(loadedSub).length !== 0){
                loadSub(loadedSub, rootNode);
            }
            mouseOverPart = [];
        }
    });

    saveButton.on('pointerover', () => {
        document.body.style.cursor = 'pointer';
        saveButton.frame = saveButton.texture.frames["saveButtonOver.png"];
    });
    saveButton.on('pointerout', () => {
        document.body.style.cursor = 'default';
        saveButton.frame = saveButton.texture.frames["saveButtonUp.png"];
    });
    saveButton.on('pointerdown', () => {
        const savedSubJSON = JSON.stringify(saveSub(rootNode.list[0]));
        localStorage.setItem('savedSub',savedSubJSON);
    });

    launchButton.on('pointerover', () => {
        document.body.style.cursor = 'pointer';
        launchButton.frame = launchButton.texture.frames["launchButtonOver.png"];
    });
    launchButton.on('pointerout', () => {
        document.body.style.cursor = 'default';
        launchButton.frame = launchButton.texture.frames["launchButtonUp.png"];
    });
    launchButton.on('pointerdown', () => {
    });

    //Shop Interface Stuff
    shopInterface = scene.add.container(0,0);
    var lowerScreen = scene.add.image(-23,53.1,'interface','lowerScreen.png').setInteractive();
    lowerScreen.alpha = 0.1;
    shopInterface.add(lowerScreen);

    scene.input.on('pointerup', function (pointer){
        pointerState = 'up';
    });
    scene.input.on('pointermove', function (pointer) {
        pointerX = pointer.x;
        pointerY = pointer.y;
    });
    lowerScreen.on('pointerout', () =>{
        document.body.style.cursor = 'default';
        pointerOnShop = false;
    });
    lowerScreen.on('pointerover', () => {
        document.body.style.cursor = 'grab';
        pointerOnShop = true;
    });
    lowerScreen.on('pointerdown', () => {
        pointerState = 'down'
    });

    for(var parts of allSubParts){
        createPart(parts.partType, true);
    }

    //Add all the parts to the screen interface
    for(var i=0;i<partsList.length;i++){
        addPartToShopInterface(partsList[i]);
        partsList[i].x = sumOfPreviousPartsWidth(i, partsList, 80)-220;
        partsList[i].originalX = partsList[i].x;
    }
    totalPartsListWidth = sumOfPreviousPartsWidth(partsList.length, partsList, 50);

    //Building Sub Screen
    buildInterface = scene.add.container();
    var upperScreen = scene.add.image(-22.75,-102.5,'interface','upperScreen.png').setInteractive();
    upperScreen.alpha = 0.1;
    buildInterface.add(upperScreen);
    createRootNode();
    buildTargetX = workshopInterfaceX+rootNode.x;
    buildTargetY = workshopInterfaceY+rootNode.y;

    upperScreen.on('pointerover', () => {
        if(allPingGraphics.length > 0){return};
        mouseOverBuildScreen = true;
        scene.input.topOnly = true;
    });
    upperScreen.on('pointerout', () => {
        mouseOverBuildScreen = false;
        scene.input.topOnly = false;
    });
    upperScreen.on('pointerdown', () => {
        if(mouseOverPart.length == 0){
            partSelected = null;
            destroySelectRect();
            updateBuildScreenText();
        }
    });

    //Trash button
    var binIcon = scene.add.image(195,-164,'interface','binIcon.png').setInteractive();
    binIcon.alpha = 0.8;
    buildInterface.add(binIcon);
    binIcon.on('pointerover', () => {
        if(buildScreenFrozen){return};
        binIcon.alpha = 1;
        document.body.style.cursor = 'pointer';
        mouseOverBuildScreenIcons = true;
    });
    binIcon.on('pointerout', () => {
        if(buildScreenFrozen){return};
        binIcon.alpha = 0.9;
        document.body.style.cursor = 'default';
        mouseOverBuildScreenIcons = false;
    });
    binIcon.on('pointerdown', () => {
        if(buildScreenFrozen){return};
        if(partSelected == null){
            if(rootNode.list.length === 0){return};
            buildScreenFrozen = true;
            dialogueBoxYesCancel(()=>{
                buildScreenFrozen = false;
                trashSub();
                destroySelectRect();
                scene.sound.add('trash').play();
            },buildInterface,"Are you sure you want to destroy the sub?");
        } else {
            trashPart();
        }
        partSelected = null;
        destroySelectRect();
        updateBuildScreenText();
    });

    //Stats Button
    var statsIcon = scene.add.image(165,-164,'interface','statsIcon.png').setInteractive();
    statsIcon.alpha = 0.8;
    buildInterface.add(statsIcon);
    statsIcon.on('pointerover', () => {
        if(buildScreenFrozen){return};
        statsIcon.alpha = 1;
        document.body.style.cursor = 'pointer';
        mouseOverBuildScreenIcons = true;
    });
    statsIcon.on('pointerout', () => {
        if(buildScreenFrozen){return};
        statsIcon.alpha = 0.9;
        document.body.style.cursor = 'default';
        mouseOverBuildScreenIcons = false;
    });
    statsIcon.on('pointerdown', () => {
        if(buildScreenFrozen){return};
        buildScreenFrozen = true;
        statsDialogue(buildInterface, getSubStats());
        destroySelectRect();
    });

    //Build screen text
    buildScreenText = scene.add.bitmapText(-252,-175,'MKOCR', '',14);
    updateBuildScreenText();
    buildScreenText.setTint(colours.lime);
    buildInterface.add(buildScreenText);
    
    //global positioned because that's how masks do
    var lowerScreenMask = scene.add.image(workshopInterfaceX-23.75, workshopInterfaceY+53,'interface','lowerScreen.png');
    workshopInterface.add(lowerScreenMask)
    lowerScreenMask.setVisible(false);
    shopInterface.mask = new Phaser.Display.Masks.BitmapMask(scene, lowerScreenMask);
    workshopInterface.add(shopInterface);

    var upperScreenMask = scene.add.image(workshopInterfaceX-22.75, workshopInterfaceY-102.5,'interface','upperScreen.png').setInteractive();
    workshopInterface.add(upperScreenMask)
    upperScreenMask.setVisible(false);

    buildInterface.mask = new Phaser.Display.Masks.BitmapMask(scene, upperScreenMask);
    workshopInterface.add(buildInterface);
 
    //Parts text above the shop interface
    var partsPlate = scene.add.image(-216,-4,'interface','partsPlate.png');
    workshopInterface.add(partsPlate);

    //Shader Effects
    var postFxPlugin = scene.plugins.get('rexhorrifipipelineplugin');
    var postFxPluginGlow = scene.plugins.get('rexglowfilter2pipelineplugin');

    var postFxPipeline = postFxPluginGlow.add(shopInterface, { distance: 6, outerStrength: 1.25,  innerStrength: 0, glowColor: colours.lime, quality: 5});
    var postFxPipeline = postFxPluginGlow.add(buildInterface, { distance: 6, outerStrength: 1.25,  innerStrength: 0, glowColor: colours.lime, quality: 5});

    var openingTone = scene.sound.add('opening').play();
}

function getAbsolutelyAll(container) {
    let objects = [];
    container.getAll().forEach(function(object) {
        if(object.type === "Container"){
            objects.push(object);
            if (object.list.length > 0) {
                objects = objects.concat(getAbsolutelyAll(object));
            }
        }
    });
    return objects;
}

function dialogueBoxYesCancel(yesFunc,addTo,text){
    let dialogueBoxContainer = scene.add.container();
    let dialogueBox = scene.add.rectangle(-20,-110,340,100,colours.navy);
    dialogueBox.setStrokeStyle(1,colours.lime);
    dialogueBoxContainer.add(dialogueBox);

    let dialogueText = scene.add.bitmapText(-20,-130,'MKOCR', text,14).setOrigin(0.5);
    dialogueText.setTint(colours.lime);
    dialogueBoxContainer.add(dialogueText);

    let yesButton = dialogueButton(()=>{
        yesFunc();
        dialogueBoxContainer.destroy();
    },"Yes", );

    let cancelButton = dialogueButton(()=>{
        dialogueBoxContainer.destroy();
        buildScreenFrozen = false;
    },"Cancel");

    yesButton.x = -70;
    cancelButton.x = 30;
    yesButton.y = -95;
    cancelButton.y = -95;

    dialogueBoxContainer.add(yesButton);
    dialogueBoxContainer.add(cancelButton);
    addTo.add(dialogueBoxContainer);
}
function getSubStats(){
    let subStats = {
        firepower:0,
        cost:0,
        accessible:"Inaccesible",
        weight:0,
        thrust:0,
        armor:0,
        visibility:0,
        miningPower:0,
    };
    for(let parts of allParts){
        for(let partLookup of allSubParts){
            if(typeof partLookup.partType == 'string'){
                if(partLookup.partType == parts.name){
                    for(let stat in partLookup){
                        if(subStats.hasOwnProperty(stat)){
                            if(typeof partLookup[stat] == 'number'){
                                subStats[stat] += partLookup[stat];
                            }
                            if(typeof partLookup[stat] == 'string'){
                                subStats[stat] = partLookup[stat];
                            }
                        }
                    }
                }
            } else {
                if(partLookup.partType[2] == parts.name){
                    for(let stat in partLookup){
                        if(subStats.hasOwnProperty(stat)){
                            if(typeof partLookup[stat] == 'number'){
                                subStats[stat] += partLookup[stat];
                            }
                            if(typeof partLookup[stat] == 'string'){
                                subStats[stat] = partLookup[stat];
                            }
                        }
                    }
                }
            }
        }
    }
    return subStats;
}

function statsDialogue(addTo,stats){
    let dialogueBoxContainer = scene.add.container();

    let upperScreen = scene.add.image(-22.75,-102.5,'interface','upperScreen.png');
    upperScreen.scale = 1.02;
    dialogueBoxContainer.add(upperScreen);

    let statsText1 = "Firepower:   " + stats.firepower + "\n" + 
    "Mining Power:   " + stats.miningPower + "\n" +
    "Thrust:   " + stats.thrust + "\n" + 
    "Visibility:   " + stats.visibility + "\n";

    let statsText2 = "Cost:   " + stats.cost + " Credits\n" + 
    "Accesibility:   " + stats.accessible + "\n" + 
    "Weight:   " + stats.weight + "\n" + 
    "Armor:   " + stats.armor + "\n";

    let dialogueIcon = scene.add.image(-235,-160,'interface','statsIcon.png').setOrigin(0.5,0.5);
    dialogueBoxContainer.add(dialogueIcon);

    let dialogueTitleText = scene.add.bitmapText(-215,-157,'MKOCR', "Submarine Statistics", 20).setOrigin(0,0.5);
    dialogueTitleText.setTint(colours.lime);
    dialogueBoxContainer.add(dialogueTitleText);

    let dialogueStat1Text = scene.add.bitmapText(-250,-130,'MKOCR', statsText1, 15).setOrigin(0,0);
    dialogueStat1Text.setTint(colours.lime);
    dialogueBoxContainer.add(dialogueStat1Text);

    let dialogueStat2Text = scene.add.bitmapText(-50,-130,'MKOCR', statsText2, 15).setOrigin(0,0);
    dialogueStat2Text.setTint(colours.lime);
    dialogueBoxContainer.add(dialogueStat2Text);

    let closeButton = dialogueButton(()=>{
        dialogueBoxContainer.destroy();
        buildScreenFrozen = false;
    },"Close");
    closeButton.x = 180;
    closeButton.y = -160;
    dialogueBoxContainer.add(closeButton);
    addTo.add(dialogueBoxContainer);
}

function dialogueButton(func,text){
    let buttonContainer = scene.add.container();
    var button = scene.add.rectangle(-10,0,text.length*12,20, colours.navy);
    button.setStrokeStyle(1,colours.lime);
    buttonContainer.add(button);
    let buttonText = scene.add.bitmapText(-10,3,'MKOCR', text,14).setOrigin(0.5);
    buttonText.setTint(colours.lime);
    buttonContainer.add(buttonText);
    button.setInteractive();

    button.on('pointerover', () => {
        document.body.style.cursor = 'pointer'; 
        button.setFillStyle(colours.navyHighlight);
    });
    button.on('pointerout', () => {
        document.body.style.cursor = 'default';
        button.setFillStyle(colours.navy);
    });
    button.on('pointerdown', () => {
        func();
    });

    return buttonContainer;
}

function saveSub(obj) {
    var subCopy = {};
    for (var key in obj) {
      if ((key === "x" || key === "y" || key === "list" || key === "name" || key === "flipped" || key === "rotated" || key === "connectedVia")) {
        if (typeof obj[key] === "object") {
          if (Array.isArray(obj[key])) {
            subCopy[key] = obj[key].filter(object => object.type === "Container" && object.name !== "").map(item => saveSub(item));
          }
        } else {
          subCopy[key] = obj[key];
        }
      }
    }
    return subCopy;
}

function loadSub(obj,parentPart) {
    let newPartType = buildRules(obj.name);
    const currentPart = addPartToBuildInterface(createPart(newPartType), obj.x, obj.y,parentPart,newPartType,obj.flipped, {connectedWith: obj.connectedVia}, obj.rotated);
    for(var nodes of parentPart.subNodes){
        if(nodes.connectedWith == currentPart.connectedVia){
            nodes.engaged = true;
        }
    }
    for (var key in obj) {
        if (typeof obj[key] === "object") {
          if (Array.isArray(obj[key])) {
            obj[key].map(item => loadSub(item,currentPart));
          }
        }
    }
}

function createPart(partName, addingToShop){
    if(partName === 'skip'){
        return;
    }
    if(typeof partName === 'string'){
        //Handles animated parts "animProp_"
        if(partName.startsWith("anim")){
            scene.anims.create({ key: partName, frames: scene.anims.generateFrameNames('submarine', {prefix: partName, start: 1, end: 34, suffix: '.png'}), repeat: -1 , frameRate:30});
            scene.anims.create({ key: partName+"H", frames: scene.anims.generateFrameNames('submarine', {prefix: partName.slice(0,-1)+"H_", start: 1, end: 34, suffix: '.png'}), repeat: -1 , frameRate:30});
            var part = scene.add.sprite(0,0).play(partName).setInteractive().setOrigin(0.5,0.5);
            part.partType = partName;
            if(addingToShop == true){
                partsList.push(part);
            }
            return part;
        }
        //Handles regular static parts
        var part = scene.add.image(0,0,'submarine',partName+'.png').setInteractive().setOrigin(0.5,0.5);
        part.partType = partName;
        if(addingToShop == true){
            partsList.push(part);
        }
        return part;
    } else {
        //Handles groups of parts
        var assembly = scene.add.container(0,0);
        for(let parts of partName[0]){
            let part = scene.add.image(0,0,'submarine',parts+'.png').setOrigin(0.5,0.5);;
            part.partType = parts;
            if(parts == "gun_turret"){part.setOrigin(0.5,1)};
            assembly.add(part);
        }
        assembly.setSize(assembly.getBounds().width,assembly.getBounds().height);
        assembly.setInteractive();
        assembly.partType = partName[2];
        if(partName[1] == true){
            partsList.push(assembly);
        }
        return assembly;
    }
}

function sumOfPreviousPartsWidth(i,parts, margin){
    var totalWidth = 0;
    for(var j=0;j<i;j++){
        totalWidth += (parts[j].width/6)+margin;
    }
    return totalWidth;
}

function addPartToShopInterface(part){
    part.scale = 0.3;
    part.y = 36;
    part.originalHeight = part.getBounds().height/300;
    
    part.tarScaleBig = .43-part.originalHeight;
    part.tarScaleSmall = .37-part.originalHeight;
    part.tarScale = part.tarScaleSmall;
   
    shopInterface.add(part);
    
    const partText = scene.add.bitmapText(0,0,'MKOCR', getPartDisplayName(part.partType) + "\n" + getPartPrice(part.partType) + " CR",13);
    partText.setTint(colours.lime);
    part.partText = partText;
    shopInterface.add(partText);

    part.on('pointerover', () => {
        if(!pointerOnShop){return;}
        part.tarScale = part.tarScaleBig;
        document.body.style.cursor = 'pointer';
        highlightPart(part);
    });
    part.on('pointerout', () => {
        if(!pointerOnShop){return;}
        part.tarScale = part.tarScaleSmall;
        document.body.style.cursor = 'grab';
        unhighlightPart(part);
    });
    part.on('pointerdown', () => {
        if(!pointerOnShop){return;}
        addPartToBuild(part.partType);
        document.body.style.cursor = 'pointer';
    });
    part.on('pointerup', () => {
        if(!pointerOnShop){return;}
        document.body.style.cursor = 'pointer';
    });
}

function updateBuildScreenText(){
    if(partSelected == null){
        buildScreenText.text = '> Credits: ' + credits.toLocaleString() + '\n> Class: A';
    } else {
        buildScreenText.text = '> Credits: ' + credits.toLocaleString() + '\n> Class: A\n> ' + getPartDisplayName(partSelected.partType);
    }
    if(credits > 0){
        buildScreenText.setTint(colours.lime);
    } else {   
        buildScreenText.setTint(colours.red);
    }
}

function highlightPart(part){
    if(part.type != 'Container'){
        if(part.partType.startsWith('anim')){
            var currentFrame = part.anims.currentFrame.index;
            part.play({key: part.partType+"H", startFrame:currentFrame-1},true);
            return;
        }
        part.frame = part.texture.frames[part.partType+"H.png"];
    } else {
        for(var components of part.list){
            components.frame = components.texture.frames[components.partType+"H.png"];
        }
    }
}

function unhighlightPart(part){
    if(part.type != 'Container'){
        if(part.partType.startsWith('anim')){
            var currentFrame = part.anims.currentFrame.index;
            part.play({key: part.partType, startFrame:currentFrame-1},true);
            return;
        }
        part.frame = part.texture.frames[part.partType+".png"];
    } else {
        for(var components of part.list){
            components.frame = components.texture.frames[components.partType+".png"];
        }
    }
}

function createRootNode(){
    rootNode = scene.add.container();
    var newStructure = JSON.parse(nodeStructure);
    rootNode = Object.assign(rootNode, newStructure.rootNode);
    rootNode.scale = 0.3;
    allParts.push(rootNode);
    buildInterface.add(rootNode);
}

function trashSub(){
    for(var parts of allParts){
        credits += getPartPrice(parts.name);
        parts.destroy();
    }
    updateBuildScreenText();
    allParts = [];
    destroySelectRect();
    removePings();
    createRootNode();
    hatchPlaced = false;
    middleHullsPlaced = 0;
}

function trashPart(){
    //reenable connections to parent parent
    for(var subNodes of partSelected.parentContainer.parentContainer.subNodes){
        if(subNodes.connectedWith === partSelected.parentContainer.connectedVia){
            subNodes.engaged = false;
        }
    }
    //destroy and refund children
    var allDestroyedPartChildren = getAbsolutelyAll(partSelected.parentContainer);            
    for(var removedPart of allDestroyedPartChildren){
        if(removedPart.name === "middle_hull"){
            middleHullsPlaced --;
        }
        if(removedPart.name === "top_hatch"){
            hatchPlaced = false;
        }
        if (allParts.includes(removedPart)) {
            allParts.splice(allParts.indexOf(removedPart), 1);
            credits += getPartPrice(removedPart.name);
        }
    }
    //destroy and refund part
    if(partSelected.parentContainer.name !== "rootNode"){
        const index = allParts.indexOf(partSelected.parentContainer);
        if(index > -1){
            allParts.splice(index,1);
        }
    }
    credits += getPartPrice(partSelected.parentContainer.name);

    //Rules stuff
    if(partSelected.parentContainer.name === "top_hatch"){
        hatchPlaced = false;
    }
    if(partSelected.parentContainer.name === "middle_hull"){
        middleHullsPlaced --;
    }

    //This kills the part
    partSelected.parentContainer.destroy();
}

function addPartToBuildInterface(part,x,y,parentPart,partType,flipped,originNode,rotated){
    if(partType === 'skip'){
        return;
    }
    var partContainer = scene.add.container();
    if(rotated != undefined){
        partContainer.angle = rotated;
        partContainer.rotated = rotated;        
    }
    partContainer.alpha = 0;
    partContainer.x = x;
    partContainer.y = y;
    if(flipped == true){
        partContainer.flipped = flipped;
        partContainer.scaleX = -1;
    }
    var newStructure = JSON.parse(nodeStructure);
    if(Array.isArray(partType)){
        partType = partType[2];
    }
    partContainer = Object.assign(partContainer, newStructure[partType]);
    
    //Preventing reverse connections
    if(partType == 'middle_hull'){
        middleHullsPlaced ++;
        if(originNode.connectedWith == 'A'){
            partContainer.subNodes = partContainer.subNodes.filter(function(obj){
                return obj.connectedWith !== 'B';
            });
        }
        if(originNode.connectedWith == 'B'){
            partContainer.subNodes = partContainer.subNodes.filter(function(obj){
                return obj.connectedWith !== 'A';
            });
        }
    }
    if(partType == 'back_hull' || partType == 'front_hull'){
        if(originNode.connectedWith == 'A' || originNode.connectedWith == 'B'){
            partContainer.subNodes = partContainer.subNodes.filter(function(obj){
                return obj.connectedWith !== 'B' && obj.connectedWith !== 'A';
            });
        }
    }
    
    partContainer.connectedVia = originNode.connectedWith;
    //Only one hatch
    if(partType == 'top_hatch'){
        hatchPlaced = true;
    }

    part.setInteractive();
    part.on('pointerover', () => {
        if(allPingGraphics.length > 0 || buildScreenFrozen){return};
        mouseOverPart.push(part);
    });
    part.on('pointerout', () => {
        const index = mouseOverPart.indexOf(part);
        if(index > -1){
            mouseOverPart.splice(index,1);
        }
        unhighlightPart(part);
    });
    part.on('pointerdown', () => {
        if(allPingGraphics.length > 0 || buildScreenFrozen){return};
        partSelected = part;
        updateBuildScreenText();
        destroySelectRect();
        drawSelectRect(part);
    });
    
    credits -= getPartPrice(partType);
    updateBuildScreenText();

    partContainer.add(part);
    parentPart.add(partContainer);
    allParts.push(partContainer);
    return partContainer;
}

function getPartDisplayName(partType){
    for(var parts of allSubParts){
        if(parts.partType === partType){
            return parts.displayName;
        }
    }
    if(partType === 'gun_assembly'){
        return "Cannon";
    }
}

function getPartPrice(partType){
    for(var parts of allSubParts){
        if(parts.partType === partType){
            return parts.cost;
        }
    }
    if(partType === 'gun_assembly'){
        return 150;
    }
    return 0;
}

var hatchPlaced = false;
var middleHullsPlaced = 0;

function buildRules(partType){
    if(partType == 'gun_assembly'){
        return [['gun_turret','gun_base'],false,'gun_assembly'];
    }
    if(partType == 'top_hatch' && hatchPlaced){
        return 'skip';
    }
    if(partType == 'middle_hull' && middleHullsPlaced >= 2){
        return 'skip';
    }
    return partType;
}

function addPartToBuild(partType){
    destroySelectRect();
    //Search all parts for a place to put new part.
    var foundNodes = [];
    for(var parts of allParts){
        for(var subNodes of parts.subNodes){
            if(subNodes.part == partType && subNodes.engaged == false){
                let newPartType = buildRules(partType); //apply rules
                if(newPartType == 'skip' || buildScreenFrozen){return};
                foundNodes.push({PartType:newPartType,part:parts,x:subNodes.x, y:subNodes.y, subNodes:subNodes, connectionType:subNodes.connectedWith, flipped:subNodes.flipped, rotated:subNodes.rotated});
            }
        }
    }
    //Place the part if only one option
    if(foundNodes.length == 1){
        var buildNode = foundNodes[0];
        buildNode.subNodes.engaged = true;
        for(var nodes of buildNode.part.subNodes){
            if(nodes.connectedWith == buildNode.connectionType){
                nodes.engaged = true;
            }
        }
        scene.sound.add('hover').play();
        addPartToBuildInterface(createPart(buildNode.PartType), buildNode.x, buildNode.y,buildNode.part,buildNode.PartType,buildNode.flipped, buildNode.subNodes, buildNode.rotated);
    }
    //Create pings if multiple options
    removePings();
    if(foundNodes.length > 1){
        for(var nodes of foundNodes){
            var pingGraphic2 = pingGraphic(nodes.x,nodes.y,nodes);
            nodes.part.add(pingGraphic2);
            allPingGraphics.push(pingGraphic2);
        }
    }
}

function removePings(){
    for(var pings of allPingGraphics){
        pings.graphic.destroy();
        pings.destroy();
    }
    allPingGraphics = [];
}

function pingGraphic(x,y,buildNode){
    const pingButton = scene.add.circle(x,y,20, 0x000000);
    pingButton.setInteractive();
    pingButton.alpha = 0.01;
    pingButton.on('pointerover', () => {
        document.body.style.cursor = 'pointer'; 
    });
    pingButton.on('pointerout', () => {
        document.body.style.cursor = 'default';
    });

    pingButton.on('pointerdown', () => {
        document.body.style.cursor = 'default';
        buildNode.subNodes.engaged = true;
        for(var nodes of buildNode.part.subNodes){
            if(nodes.connectedWith == buildNode.connectionType){
                nodes.engaged = true;
            }
        }
        mouseOverBuildScreen = true;
        scene.input.topOnly = true;
        scene.sound.add('hover').play();
        addPartToBuildInterface(createPart(buildNode.PartType), buildNode.x, buildNode.y,buildNode.part,buildNode.PartType,buildNode.flipped, buildNode.subNodes, buildNode.rotated);
        removePings();
    });

    const pingGraphicContainer = scene.add.container();
    const pingGraphic = scene.add.circle(6,6,4,colours.red);
    const pingGraphicOutline = scene.add.circle(6,6,4);
    pingGraphicOutline.setStrokeStyle(1,colours.red);
    pingGraphicContainer.add(pingGraphic);
    pingGraphicContainer.add(pingGraphicOutline);
    pingButton.graphic = pingGraphicContainer;
    buildInterface.add(pingGraphicContainer);

    return pingButton;
}

var shopScrollTar = 0;
var prevPointerX = 0;
var pointerDelta = 0;
var pointerState;
var pointerX;
var pointerY;
var buildTargetX;
var buildTargetY;
var scaleTar = 0.2;

var rectGraphics = [];

function drawSelectRect(target){
    const gWidth = target.getBounds().width/2+8;
    const gHeight = target.getBounds().height/2+8;
    const sLength = 10;
    var selectRect = scene.add.container();
    var graphics = scene.add.graphics();
    graphics.lineStyle(2,colours.lime);
    var line1 = graphics.lineBetween(-gWidth,-gHeight,-gWidth+sLength,-gHeight);
    selectRect.add(line1);
    selectRect.add(graphics.lineBetween(-gWidth,-gHeight,-gWidth,-gHeight+sLength));
    selectRect.add(graphics.lineBetween(gWidth,-gHeight,gWidth-sLength,-gHeight));
    selectRect.add(graphics.lineBetween(gWidth,-gHeight,gWidth,-gHeight+sLength));
    selectRect.add(graphics.lineBetween(gWidth,gHeight,gWidth-sLength,gHeight));
    selectRect.add(graphics.lineBetween(gWidth,gHeight,gWidth,gHeight-sLength));
    selectRect.add(graphics.lineBetween(-gWidth,gHeight,-gWidth,gHeight-sLength));
    selectRect.add(graphics.lineBetween(-gWidth,gHeight,-gWidth+sLength,gHeight));
    selectRect.setSize(gWidth,gHeight);
    selectRect.x = target.getBounds().x+target.getBounds().width/2;
    selectRect.y = target.getBounds().y+target.getBounds().height/2;
    selectRect.target = target;
    rectGraphics.push(selectRect);
}

function destroySelectRect(){
    if(rectGraphics.length>0){
        rectGraphics[0].destroy();
        rectGraphics = [];
    }
}

function interfaceMovement(){
    rootNode.x -= (rootNode.getBounds().centerX - buildTargetX)/70
    rootNode.y -= (rootNode.getBounds().centerY - buildTargetY)/70
    for(var i=0;i<partsList.length;i++){
        partsList[i].x -= (partsList[i].x - (shopScrollTar+partsList[i].originalX))/28;
        partsList[i].scale -= (partsList[i].scale - partsList[i].tarScale)/12;
        partsList[i].partText.x = partsList[i].x-25;
        partsList[i].partText.y = partsList[i].y+30;
    }
    if(rootNode.getBounds().width > 1){
        var scale_X = ((rootNode.getBounds().width+rootNode.getBounds().height)/2/1000);
        rootNode.scaleX -= (scale_X - scaleTar)/20
    }
    if(rootNode.scaleX > .35){mouseOverBuildScreenIcons
        rootNode.scaleX = .35;
    }
    if(rootNode.scaleX < .2){
        rootNode.scaleX = .2;
    }
    rootNode.scaleY = rootNode.scaleX;
    for(var j=0;j<allParts.length;j++){
        allParts[j].alpha -= (allParts[j].alpha - 1)/30;
    }
    pointerDelta = pointerX - prevPointerX;
    if(pointerState == 'down'){
        if(Math.abs(pointerDelta < 10)){
            shopScrollTar += pointerDelta*6;
            if(shopScrollTar<-totalPartsListWidth){
                shopScrollTar = -totalPartsListWidth;
            }
            if(shopScrollTar>0){
                shopScrollTar = 0;
            }
        }
    }
    prevPointerX = pointerX;
    if(mouseOverBuildScreen && !mouseOverBuildScreenIcons && !buildScreenFrozen){
        if(mouseOverPart.length > 0){
            document.body.style.cursor = 'pointer'; 
        } else {
            document.body.style.cursor = 'default'; 
        }
    }
    if(mouseOverPart.length > 0){
        highlightPart(mouseOverPart[0]);
    }
    if(rectGraphics.length > 0){
        var selectRect = rectGraphics[0];
        selectRect.x = selectRect.target.getBounds().x+selectRect.target.getBounds().width/2;
        selectRect.y = selectRect.target.getBounds().y+selectRect.target.getBounds().height/2;
    }

    for(let pings of allPingGraphics){
        pings.graphic.x = pings.getBounds().x-workshopInterfaceX;
        pings.graphic.y = pings.getBounds().y-workshopInterfaceY;
        pings.graphic.list[1].scale += 0.01;
        if(pings.graphic.list[1].scale > 3){
            pings.graphic.list[1].scale = 1;
        }
        pings.graphic.list[1].alpha = 3-pings.graphic.list[1].scale;
    }
}

function update (){
    interfaceMovement();
}

//Useful for debugging positions
// scene.input.on('pointermove', function (pointer) {
//     itemToTrack.x = pointer.x;
//     itemToTrack.y = pointer.y;
// });
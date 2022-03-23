import React, { useState, useEffect } from 'react';
import './constants/Everything.css';
import { ethers } from 'ethers'
import tile1 from '../../Assets/cronosverse/tile1.jpg'
import tile2 from '../../Assets/cronosverse/tile2.jpg'
import tile3 from '../../Assets/cronosverse/tile3.jpg'
import borderboard from '../../Assets/cronosverse/border_board.png'

// redux
import { useSelector, useDispatch } from 'react-redux';
import {fetchMintData} from '../../GlobalState/cronoverseSlice'

// mui
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';

// web3 
import * as cronoverseAbi from '../../Contracts/Cronoverse.json'

let canvas_size_width = window.innerWidth / 100 * 55
let canvas_size_height = canvas_size_width / 100 * 57
let tile_size = canvas_size_width / 54 - 1

const address = '0xeC79a8677B7861E376b6940717ADCE7DB9405015'
const letters = " ABCDEFGHIJKLMNOPQRSTUVWXYZ "

const numRows = 28
const numColumns = 54
const type = ['Plains', 'Suburban', 'Commerical']

let canvas
let beforeLeft
let beforeTop
const Bitpixel = () => {
    const mintedIds = useSelector((state)=> state.cronoverse.mintedIds)
    // const mintCost = useSelector((state) => state.cronoverse.mintCost )
    // console.log(mintCost)
  
    const [flag, setFlag] = useState('hidden')
    // popup contents
    // const [mintedTile, setMintedTile] = useState([])
    const [left, setLeft] = useState(350)
    const [top, setTop] = useState(50)
    const [level, setLevel] = useState(1)
    const [tile, setTile] = useState(null)
    const [costArray, setCostArray] = useState([])
    const [tileCost, setTileCost] = useState('0')
    const [tokenId, setTokenId] = useState(1)
    // const [mintedIds, setMintedIds] = useState([])
    // mouse postion
    const [pointerX, setPointerX] = useState(10)
    const [pointerY, setPointerY] = useState(10)
    // scroll wheel 
    const [scaleVal, setScaleVal] = useState(1)
  
    // web 3
    const realProvider = new ethers.providers.Web3Provider(window.ethereum)
    const readContract = new ethers.Contract(address, cronoverseAbi.abi, realProvider)
    const signer = realProvider.getSigner()
    const writeContract = readContract.connect(signer)
    const rpcProvider = new ethers.providers.JsonRpcProvider('https://cronos-testnet-3.crypto.org:8545')
    const rpcContract = new ethers.Contract(address, cronoverseAbi.abi, rpcProvider)
    var prices

    // let yourPrice
    // redux
    const dispatch = useDispatch()
    // canvas
    const [gridWidth, setGridWidth] = useState(1)
    const [gridHeight, setGridHeight] = useState(1)
    const [context, setContext] = useState(null)
    
    // let canvasDown = false
    const [canvasDown, setCanvasDown] = useState(false)
    // callback
    const [loading, setLoading] = useState(false);
    let loadFlag = false


    // let mintIds 
    function getMousePos(cnvs, evt) {
        var rect = cnvs.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
    }

    function initCanvas() {
        canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");

        let canvas_back = document.getElementById("layerBack")
        let ctx_back = canvas_back.getContext('2d');
        
        setContext(ctx)
        let img = new Image();

        let gridWidth_temp = canvas.width / 54
        let gridHeight_temp = canvas.height / 28
        setGridWidth(gridWidth_temp)
        setGridHeight(gridHeight_temp)
   
        img.onload = function() {
            ctx_back.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
            // ctx.fillStyle = 'rgba(250,10,10,0.5)'
            // for(var i = 0; i < 54; i ++){
            //     for(var j = 0; j < 28; j ++){
            //         ctx.strokeRect(i * gridWidth_temp, j * gridHeight_temp,gridWidth_temp,gridHeight_temp);
            //     }
            // }
        };
        img.src = borderboard;
        canvas.addEventListener("mousewheel", (e) => {
            console.log('mouse wheel');
        })
    }

    async function initCost() {
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        let yourPrice = await rpcContract.mintCost(accounts[0])
        const strCost = []
        for (let i = 0; i < 3; i++) {
          let bigNum = yourPrice[i]
          let num = bigNum.toString()
          strCost.push(num)
        }
        prices = strCost
        setCostArray(strCost)
        console.log("start select")
    }

    function drawMinted() {
        console.log('draw mint');
        if ( !(mintedIds.length) ) {
            return
        }
        for (let i = 1; i < numColumns-1; i++) {
            for (let j = 1; j < numRows-1; j++) {
                const temp = getTokenId(i, j)
                let flag = 0
                for (let p = 0; p < mintedIds.length; p++) {
                    if (temp === mintedIds[p].toNumber()) {
                        flag = 1
                        break
                    }
                }
                if (flag) {
                    context.fillStyle = 'rgba(50,50,50, 0.5)'
                    context.fillRect(gridWidth * i, gridHeight * j, gridWidth, gridHeight);
                }
            }
        }
    }
    function getLevel(j, i) {
        if (i >= 9 && j >= 19 && i <= 17 && j <= 34) {
            return 4
        } else if ( i >= 7 && j >= 17 && i <= 19 && j <= 36 ){
            return 3
            
        } else if ( i >= 4 && j >= 12 && i <= 22 && j <= 41 ) {
            return 2
        } else if (i === 0 || j === 0 || i === numRows-1 || j === numColumns-1) {   
            return 0
        } else {
            return 1
        }
    }
      
    function getTokenId(j, i) {
        let id
        let temp = 52 * (i - 1) + j
        if (i <= 8 || (i === 9 && j <= 18)) {
        id = temp
            return id
        }
        if ((i >= 9 && i <= 16 && j >= 35)) {
        id = temp - (i - 8) * 16
            return id
        }
        if (i >= 10 && i <= 17 && j <= 18) {
        id = temp - (i - 9) * 16
            return id
        }
        if ((i >= 18 && i < 27) || (i >= 17 && j >= 35) ) {
        id = temp - 16 * 9
            return id
        }
    }
    const selectPixel = (left, top) => {
        let level_temp = getLevel(left, top)
        let id_temp = getTokenId(left, top)
        console.log('loading: ', loadFlag);
        if (!(level_temp > 0 && level_temp < 4)) {
            setFlag("hidden")
            setLevel(level_temp)
            return 
        }
        let isMinted = false
        if (mintedIds.length) {
            for (let i = 0; i < mintedIds.length; i++) {
                if (id_temp === mintedIds[i].toNumber()) {
                  isMinted = true
                  break;
                }      
            }
        }
        if (isMinted) {
          console.log('Minted')
          return
        }
        if (level_temp === 1) {
          setTile(tile1)
        } else if (level_temp === 2) {
          setTile(tile2)
        } else {
          setTile(tile3)
        }
        setLevel(level_temp)
        beforeLeft = left
        beforeTop = top
        setLeft(left)
        setTop(top)
        setTokenId(id_temp)
        console.log('constarray', costArray);
        setTileCost(prices[level_temp-1])
        setCanvasDown(true)
        setFlag('visible')
    }
    async function mint() {
        console.log('mint started...');
        setLoading(true)
        loadFlag = true

        console.log(tokenId);
        try {
            const tx = await writeContract.mint(tokenId, {value: tileCost})        
            await tx.wait()
            dispatch(fetchMintData())
            console.log('mint successed.');
        } catch (error) {
          throw console.log(error);
        }
        setLoading(false)
        setFlag('hidden')
    }

    useEffect(()=> {
        initCanvas()
        dispatch(fetchMintData())        
    }, [])
    
    useEffect(() => {
        initCost()
        if (mintedIds) {
            drawMinted()
            canvas.addEventListener("mousedown", (e) => {
                let gridWidth_temp = canvas.width / 54
                let gridHeight_temp = canvas.height / 28
                if (loading) {
                    return
                }
                var pos = getMousePos(canvas, e)
                let left = Math.floor(pos.x / gridWidth_temp)
                let top = Math.floor(pos.y / gridHeight_temp)
                let level_temp = getLevel(left, top) 
                if (!(level_temp > 0 && level_temp < 4)) {
                    return
                }
                let ctx = canvas.getContext("2d");
                ctx.clearRect(gridWidth_temp*beforeLeft, gridHeight_temp*beforeTop,gridWidth_temp, gridHeight_temp)
                ctx.fillStyle = 'rgba(250,10,10,0.5)'
                console.log('//////////');
                console.log("before: ", beforeLeft, beforeTop)
                console.log("current: ", left, top)
                ctx.fillRect(gridWidth_temp * left+1, gridHeight_temp * top+1, gridWidth_temp-1, gridHeight_temp-2);
                setPointerX(e.clientX)
                setPointerY(e.clientY)
                selectPixel(left, top)
            } )
        }
    }, [mintedIds])
    return (
        <div>
            <div className='bit_back' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                onMouseDown={(e) => {
                    if (loading === true) {
                    return
                    } else if (canvasDown === true) {
                        // console.log('canvas true', canvasDown);
                        setCanvasDown(false)
                    //    setFlag('visible')
                    } else {
                        // console.log('canvas false', canvasDown);
                        setFlag('hidden')
                        // canvasDown = false
                        // setCanvasDown(false)
                    }
                }}
            >
                <div style={{marginTop: '20%',marginBottom: '15%', width: '100%', display: 'flex', justifyContent: 'center',}}>
                    <canvas id="layerBack" width={`${canvas_size_width}px`} height={`${canvas_size_height}px`}
                        style={{ left: 0, top: 0, zIndex: 0,  }}
                    ></canvas>
                    <canvas id="canvas" width={`${canvas_size_width}px`} height={`${canvas_size_height}px`} 
                    style={{ zIndex: '1', position: 'absolute' }}
                    ></canvas>
                </div>
            </div>
            <div style={{ visibility: flag, position: 'fixed',left: `${pointerX+15}px`, top: `${pointerY+15}px`,
                        backgroundColor: 'white', borderRadius: '5px', border: '1px solid black', padding: '10px', zIndex: '3'  }}>
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <img src={tile} style={{width: '40px', height: '40px', borderRadius:'5px', marginRight: '10px'}} alt="tile" />
                    <div style={{ display:'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div>TokenId: {tokenId}</div>
                        <div>Type: {type[level-1]}</div>
                        <div>Location: {left}, {letters[top]} </div>
                        <div>Price: {ethers.utils.formatEther(tileCost)} ether</div>
                        <LoadingButton
                            size="small"
                            onClick={mint}
                            loading={loading}
                            variant="contained"
                        >
                            Mint
                        </LoadingButton>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Bitpixel
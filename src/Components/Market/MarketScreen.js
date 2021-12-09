import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import {
    Box,
    Dialog,
    CircularProgress,
    Stack,
    CardMedia,
    Grid,
    Card,
    Typography,
    DialogContent, 
    CardActions,
    Pagination,
    IconButton,
    Snackbar,
    Alert,
    Button,
    CardActionArea,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Item
} from '@mui/material'
import LinkIcon from '@mui/icons-material/Link';

import { loadPage, init, onListingLoaded, SortOrders, requestSort, onPage, getCollectionData } from '../../GlobalState/Market';
import { useSelector, useDispatch } from 'react-redux'
import { connectAccount, chainConnect, onProvider } from '../../GlobalState/User'
import MetaMaskOnboarding from '@metamask/onboarding';
import {useHistory} from 'react-router-dom';
import "./marketscreen.css"

export default function MarketSelection({
    collection,
    seller
}){
    const dispatch = useDispatch();
    const history = useHistory();
    const state = useSelector((state)=>{
        return state;
    });

    const[royalty, setRoyalty] = useState(null);

    const user = useSelector((state) => {
        return state.user;
    });

    useEffect(async function() {
        let address = null;
        let type = 'all';
        if(typeof collection !== 'undefined'){
            type = 'collection';
            address = collection;
        } else if(typeof seller !== 'undefined'){
            type = 'seller';
            address = seller;
        }
        await dispatch(init(state, type, address));
        await dispatch(loadPage(page, type, address, order));
        await dispatch(getCollectionData(type, address));
    }, [collection, seller]);

    useEffect(async function() {
        if (user.marketContract != null && type != "all") {
            let royalties = await user.marketContract.royalties(address)
            setRoyalty((royalties[1] / 10000) * 100);
        }
    }, [user.marketContract]);


    const page = useSelector((state) => {
        return state.market.curPage;
    })

    const address = useSelector((state) => {
        return state.market.address;
    })

    const collections = useSelector((state) => {
        return state.market.collection;
    })

    const handlePageChange = (event, value) => {
       dispatch(onPage(value));
    };

    // const response = useSelector((state) => {
    //     return state.market.response;
    // });

    const[is1155Collection, set1155Collection] = useState(false);

    const order = useSelector((state) => {
        return state.market.sortOrder;
    })

    useEffect(() => {
        dispatch(loadPage(page, type, address, order));
    }, [page, order]);


    // useEffect(() => {
    //     if(response !== null){
    //         if(response.every(e => e.is1155)){
    //             set1155Collection(true);
    //         } else {
    //             set1155Collection(false);
    //         }
    //     }
    // }, [response])

    const totalPages = useSelector((state) => {
        return state.market.totalPages;
    })

    const listings = useSelector((state) => {
        return state.market.listings[page];
    });

    const type = useSelector((state) => {
        return state.market.type;
    });


    const [buying, setBuying] = useState(false);
    const [error, setError] = React.useState({
        error: false,
        message: ""
    });

    const closeError = () => {
        setError({error: false, message: error.message});
    };

    const loadingMarket = useSelector((state) => {
        return state.market.loadingPage;
    });

    const [showSuccess, setShowSuccess] = useState({
        show : false,
        hash: ""
    });

    const closeSuccess = () => {
        setShowSuccess({
            show: false,
            hash: ""
        });
    };

    const showBuy = (listing) => async () => {
        if(user.address){
            setBuying(true);
            try{
                const tx = await user.marketContract.makePurchase(listing.listingId, {
                    'value' : listing.price
                });
                const receipt = await tx.wait();
                setShowSuccess({
                    show: true,
                    hash: receipt.hash
                });
            }catch(error){
                if(error.data){
                    setError({error: true, message: error.data.message});
                } else if(error.message){
                    setError({error: true, message: error.message});
                } else {
                    console.log(error);
                    setError({error: true, message: "Unknown Error"});
                }
            }finally{
                setBuying(false);
            }
        } else{
            if(user.needsOnboard){
                const onboarding = new MetaMaskOnboarding();
                onboarding.startOnboarding();
            } else if(!user.address){
                dispatch(connectAccount());
            } else if(!user.correctChain){
                dispatch(chainConnect());
            }
        }

    }

    const sortChanged = async (event) => {
        await dispatch(requestSort(event.target.value, type, address));
    }

    const [showCopied, setShowCopied] = useState(false);
    const copyClosed = () => {
        setShowCopied(false);
    }
    const copyLink = (nft) => () =>{
        navigator.clipboard.writeText(window.location.origin + '/listing/' + nft.listingId)
        setShowCopied(true);
    }

    const viewDetails = (listing) => () => {
        history.push(`/listing/${listing.listingId}`);
    }

    const sortOrder = useSelector((state) => {
        return state.market.sortOrder;
    })

    return(
        <Box mb={16} mt={4} >
        <Stack >
        <Box sx={{ flexGrow: 1, height: "auto", marginBottom: "30px" }}>
        {(collections)?
        <Grid sx={{}} container spacing={4} justifyContent="center" alignItems="center" direction='row'>
            <Grid item xs={4} textAlign="center">
                <Box className='gridItem'>
                    <Typography className='dataTitle'>
                        Floor
                    </Typography>
                    <Typography className='dataValue'>
                        {ethers.utils.commify(Number(collections.floorPrice).toFixed(0))} CRO
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={4} textAlign="center" >
                <Box className='gridItem'>
                    <Typography className='dataTitle'>
                        Avg. Sale
                    </Typography>
                    <Typography className='dataValue'>
                        {isNaN(collections.averagePrice) ?
                            "N/A"
                        : 
                            ethers.utils.commify(Number(collections.averagePrice).toFixed(0)) + " CRO"
                        }
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={4} textAlign="center" >
                <Box className='gridItem'>
                    <Typography className='dataTitle'>
                        Royalty
                    </Typography>
                    <Typography className='dataValue'>
                        {royalty}%
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={4} textAlign="center" >
                <Box className='gridItem'>
                    <Typography className='dataTitle'>
                        Volume
                    </Typography>
                    <Typography className='dataValue'>
                        {ethers.utils.commify(Number(collections.totalVolume).toFixed(0))} CRO
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={4} textAlign="center" >
                <Box className='gridItem'>
                    <Typography className='dataTitle'>
                        Sales
                    </Typography>
                    <Typography className='dataValue'>
                    {ethers.utils.commify(collections.numberOfSales)}
                    </Typography>
                </Box>
            </Grid>
            <Grid item xs={4} textAlign="center" >
                <Box className='gridItem'>
                    <Typography className='dataTitle'>
                        Active
                    </Typography>
                    <Typography className='dataValue'>
                    {ethers.utils.commify(collections.numberActive)}
                    </Typography>
                </Box>
            </Grid>
        </Grid>
        : null
        }
        </Box>
        <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Sort By</InputLabel>
            <Select
                labelId="sort-order"
                id="sort-order-select"
                value={sortOrder}
                label="Sort Order"
                onChange={sortChanged}
            >
                {
                    ((is1155Collection) ? SortOrders.filter(e => e !== "Id"): SortOrders).map((e) => {
                        return(<MenuItem value={e}>{e}</MenuItem>)
                    })
                }
            </Select>
        </FormControl>
            
            <Grid container spacing={4} justifyContent="center" alignItems="center" direction='row'>
                {(!listings) ? null :  (listings.length !== 0) ?
                
                listings.map((val) => 
                    <Grid item xs={12} xl={3} lg={3} md={4} sm={6}  key={val.listingId.toNumber()}>
                        <Card>
                            <CardActionArea onClick={viewDetails(val)}>
                                <CardMedia  component='img' image={val.nft.image} height='285' sx={{}} />

                                <Box sx={{ p: 2, height : 150}}>
                                    <Typography  noWrap variant="h5" color='primary'>
                                        {val.nft.name}
                                    </Typography>

                                    <Typography variant='subtitle2' paragraph>
                                        {val.nft.description}
                                    </Typography>
                                    <Typography variant="subtitle2" color='primary'>
                                        {ethers.utils.commify(ethers.utils.formatEther(val.price))} CRO
                                    </Typography>
                                </Box>

                            </CardActionArea>
                            <CardActions>
                                <Button onClick={showBuy(val)}>Buy</Button>
                                <Button onClick={viewDetails(val)}>Details</Button>
                                <IconButton color='primary' onClick={copyLink(val)}>
                                    <LinkIcon/>
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ) :
   
                        <Box mt={16}>
                            <Typography variant='h3' color='primary'>No Listings Found Check Back Soon.</Typography>
                        </Box>
                    
                }
            </Grid> 
        
            {
                (loadingMarket || listings == null || listings.length === 0) ? null : <Pagination defaultPage={page} count={totalPages} page={page} siblingCount={3} boundaryCount={2} onChange={handlePageChange}/>
            }
            

        </Stack>
        
        <Snackbar open={showCopied} autoHideDuration={6000} onClose={copyClosed}>
            <Alert onClose={copyClosed} severity="success" sx={{ width: '100%' }}>
                Link Copied!
            </Alert>
        </Snackbar>

        <Dialog
            open={buying}>
            <DialogContent>
                <Stack spacing={2} direction='row'>
                    <CircularProgress/>
                    <Typography variant='h3'>
                        Attempting Purchase...
                    </Typography>
                </Stack>
            </DialogContent>
        </Dialog>

        <Snackbar  
            open={error.error} 
            autoHideDuration={10000} 
            onClose={closeError}
            sx={{ top: "85%" }}>
            <Alert onClose={closeError} severity="error" sx={{ width: '100%' }}>
                {`Error whilst processing transaction:\n ${error.message}`}
            </Alert>
        </Snackbar>
        <Snackbar  
            open={showSuccess.show} 
            autoHideDuration={10000} 
            onClose={closeSuccess}>
            <Alert onClose={closeSuccess} severity="success" sx={{ width: '100%' }}>
                Transaction was successful!
            </Alert>
        </Snackbar>

        <Dialog
            open={loadingMarket}>
            <DialogContent>
                <Stack spacing={2} direction='row'>
                    <CircularProgress/>
                    <Typography variant='h3'>
                        Loading...
                    </Typography>
                </Stack>
            </DialogContent>
        </Dialog>
        </Box>
    )
}
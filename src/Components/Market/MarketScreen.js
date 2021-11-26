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
} from '@mui/material'
import LinkIcon from '@mui/icons-material/Link';

import { loadPage, init, onListingLoaded } from '../../GlobalState/Market';
import { useSelector, useDispatch } from 'react-redux'
import { connectAccount, chainConnect } from '../../GlobalState/User'
import MetaMaskOnboarding from '@metamask/onboarding';
import {useHistory} from 'react-router-dom';

export default function MarketSelection({
    collection,
    seller
}){
    const dispatch = useDispatch();
    const history = useHistory();
    const state = useSelector((state)=>{
        return state;
    });

    useEffect(() => {
        let type = 'all';
        let address;
        if(typeof collection !== 'undefined'){
            type = 'collection';
            address = collection;
        } else if(typeof seller !== 'undefined'){
            type = 'seller';
            address = seller;
        }
        dispatch(init(state, type, address));
    }, [collection, seller]);

    const [page, setPage] = React.useState(1);
    const handleChange = (event, value) => {
      setPage(value);
    };

    const response = useSelector((state) => {
        return state.market.response;
    });


    useEffect(() => {
        if(typeof listings === "undefined" && response != null){
            dispatch(loadPage(state, page));
        }
    }, [page, response]);

    const totalPages = useSelector((state) => {
        return state.market.totalPages;
    })

    const listings = useSelector((state) => {
        return state.market.listings[page];
    });

    const user = useSelector((state) => {
        return state.user;
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

    const [showCopied, setShowCopied] = useState(false);
    const copyClosed = () => {
        setShowCopied(false);
    }
    const copyLink = (nft) => () =>{
        navigator.clipboard.writeText(window.location.origin + '/listing/' + nft.listingId)
        setShowCopied(true);
    }

    const viewDetails = (listing) => () => {
        dispatch(onListingLoaded(listing));
        history.push(`/listing/${listing.listingId}`);
    }

    return(
        <Box mb={16} mt={4} >
        <Stack >
            
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
                (loadingMarket || listings == null || listings.length === 0) ? null : <Pagination count={totalPages} page={page} siblingCount={3} boundaryCount={2} onChange={handleChange}/>
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
            <Alert onClose={closeSuccess} severity="error" sx={{ width: '100%' }}>
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
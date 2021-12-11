import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ListingCard from './ListingCard';
import {clearSet, fetchListings, filterListings} from "../../GlobalState/marketplaceSlice";

const ListingCollection = ({ showLoadMore = true, collectionId = null , sellerId = null}) => {

    const dispatch = useDispatch();
    const listings = useSelector((state) => state.marketplace.listings)
    const [height, setHeight] = useState(0);

    const onImgLoad = ({target:img}) => {
        let currentHeight = height;
        if(currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }

    const canLoadMore = useSelector((state) => {
        return state.marketplace.curPage < state.marketplace.totalPages;
    });

    useEffect(() => {
        dispatch(clearSet());
        if(collectionId){
            dispatch(filterListings('collection', collectionId));
        } else if(sellerId){
            dispatch(filterListings('seller', sellerId));
        } else {
            dispatch(fetchListings());
        }
    }, [dispatch]);

    // //will run when component unmounted
    // useEffect(() => {
    //     return () => {
    //         dispatch(clearFilter());
    //         dispatch(clearNfts());
    //     }
    // },[dispatch]);

    const loadMore = () => {
        dispatch(fetchListings());
    }

    return (
        <div className='row'>

            {listings && listings.map( (listing, index) => (
                <ListingCard listing={listing} key={index} onImgLoad={onImgLoad} height={height} />
            ))}
            { showLoadMore && canLoadMore &&
                <div className='col-lg-12'>
                    <div className="spacer-single"></div>
                    <span onClick={loadMore} className="btn-main lead m-auto">Load More</span>
                </div>
            }
        </div>              
    );
};

export default memo(ListingCollection);
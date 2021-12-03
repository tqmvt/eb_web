import React from 'react'
import { useParams } from "react-router-dom";

import { 
    Container,
    Box,
} from '@mui/material'
import ListingDetails from '../Components/Market/ListingDetails'

export const DirectListing = () => {
    let { id } = useParams();
    return(
        <Container maxWidth='lg'>
            <Box mt={16} mb={16}>
                <ListingDetails listingId={id} />
            </Box>
        </Container>
    )
}
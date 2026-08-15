import React, { useEffect, useState } from 'react';

import api from '../api';

import { Grid,Typography, Avatar, Box, Card, CardHeader, CardActions, CardMedia, CardContent, IconButton, InputBase,  } from "@mui/material";






const Feed = () => {

 const [images, setImages] = useState([]);

  useEffect(() => {
    api.get("/api/images/")
      .then(res => setImages(res.data))
      .catch(err => console.error(err));
  }, []);



    return (
        <Box bgcolor={"blue"} flex={6} p={2} >
            <Grid  gridRow={3}>
            
                {images.map(img => (
          <div key={img.id} style={{ margin: 10 }}>
            <Card  >
                <CardHeader avatar={<Avatar sx={{ backgroundColor: "red" }}
                > R</Avatar>}
                    action={
                        <IconButton aria-label="settings">

                        </IconButton>
                    }
                ></CardHeader>
                  <CardMedia component="img" image={img.image}>

                </CardMedia>


                <CardContent>
                    <Typography variant="h6">
                        {img.title}
                    </Typography>
                </CardContent>
                <CardContent>
                    <Typography variant="h6" align='left'>
                        {img.uploaded_at}
                    </Typography>
                </CardContent>
                
                <CardContent>
                    <Typography variant="h6" align='left'>
                        {img.description}
                    </Typography>
                </CardContent>
                

            </Card>
           
          </div>
        ))}
              
        </Grid>
        </Box>
    )
}
export default Feed                                     
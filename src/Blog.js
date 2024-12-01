import "./Blog.css"; // Import CSS file for styling
import { useNavigate } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";

const Blog = () => {
  
    

return (
    
    <main className="main-content">
    <section className="blog">
      <div>
        <h1 className="blog-title">BLOGS & ARTICLES</h1>
        <div className="blog-border"></div>
      </div>
    </section>
    <section className="blog-section">
        <div className="blog-container">
            <div className="blog-box">
                <div className="blog-details">
                    <h1>Blog Title</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sodales congue ligula eget laoreet. 
                        Phasellus faucibus neque orci, sit amet placerat nisi egestas ac. Aenean eleifend nisl ut gravida 
                        scelerisque. Cras euismod enim ac odio imperdiet, sit amet egestas erat feugiat. In vestibulum nibh 
                        non nunc fringilla congue.
                    </p>
                </div>
            </div>

            <div className="blog-box">
                <div className="blog-details">
                    <h1>Blog Title</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sodales congue ligula eget laoreet. 
                        Phasellus faucibus neque orci, sit amet placerat nisi egestas ac. Aenean eleifend nisl ut gravida 
                        scelerisque. Cras euismod enim ac odio imperdiet, sit amet egestas erat feugiat. In vestibulum nibh 
                        non nunc fringilla congue.
                    </p>
                </div>
            </div>

            <div className="blog-box">
                <div className="blog-details">
                    <h1>Blog Title</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sodales congue ligula eget laoreet. 
                        Phasellus faucibus neque orci, sit amet placerat nisi egestas ac. Aenean eleifend nisl ut gravida 
                        scelerisque. Cras euismod enim ac odio imperdiet, sit amet egestas erat feugiat. In vestibulum nibh 
                        non nunc fringilla congue.
                    </p>
                </div>
            </div>

            <div className="blog-box">
                <div className="blog-details">
                    <h1>Blog Title</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sodales congue ligula eget laoreet. 
                        Phasellus faucibus neque orci, sit amet placerat nisi egestas ac. Aenean eleifend nisl ut gravida 
                        scelerisque. Cras euismod enim ac odio imperdiet, sit amet egestas erat feugiat. In vestibulum nibh 
                        non nunc fringilla congue.
                    </p>
                </div>
            </div>
        </div>
    </section>
    </main>
  );
};

export default Blog;

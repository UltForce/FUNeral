import "./Blog.css"; // Import CSS file for styling
import { useNavigate } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";

const Blog = () => {
    const navigate = useNavigate();

    const handleSeeMore = () => {

        navigate("/BlogDetails");

    };


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
                    <h1>Filipino Beliefs You Should Respect When Attending Wakes</h1>
                    <p>Attending wakes in the Philippines often involves observing cultural practices rooted in deep respect for the departed and their families. 
                        Filipinos place significant importance on honoring their loved ones through traditions thatbring comfort and support to the grieving family. 
                        Here are some beliefs andpractices you should be mindful of:  <button onClick={handleSeeMore}>See More</button>
                    </p>
                </div>
            </div>

            <div className="blog-box">
                <div className="blog-details">
                    <h1>What Goes Into A Funeral Package, And How To Choose</h1>
                    <p>Funeral packages are designed to simplify the process of arranging a funeral,
                        providing families with various options tailored to their needs and budgets.
                        These packages typically include the following components:
                    </p>
                </div>
            </div>

            <div className="blog-box">
                <div className="blog-details">
                    <h1>What are the Death Traditions in the Philippines?</h1>
                    <p>Death traditions in the Philippines are a unique blend of indigenous practices
                        and Catholic influences, reflecting the country’s deep spirituality and family-oriented
                        culture. These traditions often aim to honor the deceased, support the grieving, and
                        guide the soul to the afterlife. Key practices include:

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

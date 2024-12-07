import "./BlogDetails.css";
import React, { useEffect, useState } from "react";

const BlogDetails = () => {

    return(
        <main className="main-content">
    <section className="blog_pages">
      <div>
        <h1 className="blog-title">Filipino Beliefs You Should Respect When Attending Wakes</h1>
        <div className="blog-border"></div>
      </div>
    </section>
    <section className="blog-section">
        <div className="blog-container">
            <div className="blog-box">
                <div className="blog-details">
                    
                    <p>Attending wakes in the Philippines often involves observing cultural practices 
                        rooted in deep respect for the departed and their families. Filipinos place 
                        significant importance on honoring their loved ones through traditions that 
                        bring comfort and support to the grieving family. Here are some beliefs and 
                        practices you should be mindful of:
                        
                        
                            <div className="blog-details-img">
                            <img src="/funeral pics/Blog1.jpg" alt="Filipino Beliefs"></img>

                            </div>
                            

                        

                        
                        

                        <ul>
                            <li>Refraining from Wearing Bright Colors: Black or subdued tones are preferred to symbolize mourning and respect. Avoid wearing loud or bright colors that may be seen as inappropriate. </li>
                            <li>Offering Prayers: Prayers, novenas, and religious services are often conducted during the wake. Visitors are encouraged to participate or offer a silent prayer for the deceased.</li>
                            <li>Observing Superstitions: Filipinos have various superstitions, such as not sweeping the floor during the wake, as it is believed to 'sweep away' the soul of the departed. Another common belief is not to go directly home after attending a wake to avoid bringing bad spirits with you.</li>
                            <li>Participating in Rituals: Rituals like the “pa-siyam” (nine days of prayers) are held to pray for the soul of the deceased. Visitors may also be invited to take part in these ceremonies, showing solidarity with the grieving family.</li>
                        </ul>  
                        <p> By understanding and respecting these beliefs, you contribute to a supportive environment for the family and help preserve these meaningful Filipino traditions. </p>

                        <p>REFERENCES:
                        https://heritagememorialpark.com.ph/filipino-beliefs-you-should-respect/
                        </p>
                       
                    </p>
                </div>
            </div>

           
        </div>
    </section>
    </main>       
    );
};

export default BlogDetails;
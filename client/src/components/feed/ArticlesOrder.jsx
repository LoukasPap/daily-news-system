import React, { useState, useEffect } from "react";

import {
  VStack,
  HStack,
} from "@chakra-ui/react";

import { Link as RRLink, useNavigate } from "react-router-dom";
import ArticleBox from "./ArticleBox";

const ArticlesOrder = ({ data }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`${window.apiIP}/verify-token/${token}`);

        if (response.ok) {
          console.log(response.message)
          
        }
      } catch (error) {
        navigate("/home", { replace: true });
      }
    };

    verifyToken();
  }, []);

  const updateViewHistory = async (event, articleID, articleCategory) => {
    try {
      console.log("updating " + articleID)

      fetch(`${window.apiIP}/update_views`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({"aid": articleID, "category": articleCategory})
      })
      .then( (res) => {
        console.log("Updated user read history", res);
      })
      .catch( (err) => {
        throw new Error(err);
      });

      // const responseData = await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  return (
    <HStack align={"start"}>
      {data.map((articlesArray, outerIndex) => (
        <VStack p="1">
          {articlesArray.map((articleObj, inIndex) => (
            <RRLink
              to={`/article/${articleObj.title.replace("/","-")}`}
              state={{ data: articleObj }}
              onClick={(e) => updateViewHistory(e, articleObj._id, articleObj.category) }
            >
              <ArticleBox
                articleData={articleObj}
                articleIndex={`${outerIndex}_${inIndex}`}
              />
            </RRLink>
          ))}
        </VStack>
        
      ))}
    </HStack>
  );
};

export default ArticlesOrder;

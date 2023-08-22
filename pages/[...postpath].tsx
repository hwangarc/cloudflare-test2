import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { GraphQLClient, gql } from 'graphql-request';

interface Post {
  id: string;
  excerpt: string;
  title: string;
  link: string;
  dateGmt: string;
  modifiedGmt: string;
  content: string;
  author: {
    node: {
      name: string;
    };
  };
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string | null;
    };
  };
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const endpoint = process.env.GRAPHQL_ENDPOINT as string;
  const graphQLClient = new GraphQLClient(endpoint);
  const referringURL = ctx.req.headers?.referer || null;
  const pathArr = ctx.query.postpath as string[];
  const path = pathArr.join('/');
  const fbclid = ctx.query.fbclid;

  if (referringURL?.includes('facebook.com') || fbclid) {
    return {
      redirect: {
        permanent: false,
        destination: `${endpoint.replace(/(\/graphql\/)/, '/') + encodeURI(path as string)}`,
      },
    };
  }

  const query = gql`
    {
      post(id: "/${path}/", idType: URI) {
        id
        excerpt
        title
        link
        dateGmt
        modifiedGmt
        content
        author {
          node {
            name
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  `;

  try {
    const data = await graphQLClient.request<{ post: Post }>(query);
    
    if (!data.post) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        path,
        post: data.post,
        host: ctx.req.headers.host,
      },
    };
  } catch (error) {
    console.error('GraphQL request failed:', error);
    return {
      notFound: true,
    };
  }
};

interface PostProps {
  post: Post;
  host: string;
  path: string;
}

const PostPage: React.FC<PostProps> = (props) => {
  const { post, host, path } = props;

  const removeTags = (str: string) => {
    if (str === null || str === '') return '';
    else str = str.toString();
    return str.replace(/(<([^>]+)>)/gi, '').replace(/\[[^\]]*\]/, '');
  };

  return (
    <>
      <Head>
        {/* ... Meta tags and head content */}
      </Head>
      <div className="post-container">
        {/* ... Render post content */}
      </div>
    </>
  );
};

export default PostPage;

import React, { useEffect, useMemo, useState } from "react"

import {
  Flex,
  Header,
  Skeleton,
  Spacing,
  Tabs,
  Typography,
} from "@sampled-ui/base"
import { useLocation, useNavigate } from "react-router"

import {
  useLoggedInQuery,
  useSavedArticlesLazyQuery,
  useViewedArticlesLazyQuery,
} from "../../../../generated/graphql"
import ArticleList from "../../components/Article/ArticleList"

interface CollectionPageProps {}

export const CollectionPage: React.FC<CollectionPageProps> = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [selected, setSelected] = useState(
    new URLSearchParams(location.search).get("tab") ?? "saved"
  )

  const { data: loggedInQueryData } = useLoggedInQuery()
  const [
    savedArticlesQuery,
    { data: savedArticlesQueryData, loading: loadingSavedArticles },
  ] = useSavedArticlesLazyQuery({ fetchPolicy: "cache-and-network" })
  const [
    viewedArticlesQuery,
    { data: viewedArticlesQueryData, loading: loadingViewedArticles },
  ] = useViewedArticlesLazyQuery({ fetchPolicy: "cache-and-network" })

  useEffect(() => {
    const loggedIn = !!loggedInQueryData?.loggedIn
    if (loggedIn) {
      if (selected === "viewed") {
        viewedArticlesQuery()
      } else {
        savedArticlesQuery()
      }
    }
  }, [loggedInQueryData, savedArticlesQuery, selected, viewedArticlesQuery])

  const loading = useMemo(() => {
    if (loadingSavedArticles && loadingViewedArticles) {
      return (
        <Flex
          direction="column"
          style={{ width: "100%" }}
          align="center"
          gap="lg"
        >
          <Skeleton width="40rem" height="10rem" />
          <Skeleton width="40rem" height="10rem" />
          <Skeleton width="40rem" height="10rem" />
        </Flex>
      )
    } else {
      return null
    }
  }, [loadingSavedArticles, loadingViewedArticles])

  const empty = useMemo(() => {
    if (
      (!savedArticlesQueryData?.savedArticles ||
        savedArticlesQueryData?.savedArticles?.length === 0) &&
      selected === "saved"
    ) {
      return (
        <Spacing gap="md">
          <Typography.Text disabled bold style={{ textAlign: "center" }}>
            Keine gespeicherten Artikel gefunden
          </Typography.Text>
        </Spacing>
      )
    } else if (
      (!viewedArticlesQueryData?.viewedArticles ||
        viewedArticlesQueryData?.viewedArticles?.length === 0) &&
      selected === "viewed"
    ) {
      return (
        <Spacing gap="md">
          <Typography.Text disabled bold style={{ textAlign: "center" }}>
            Keine bisher angesehenen Artikel gefunden
          </Typography.Text>
        </Spacing>
      )
    } else {
      return null
    }
  }, [
    savedArticlesQueryData?.savedArticles,
    selected,
    viewedArticlesQueryData?.viewedArticles,
  ])

  return (
    <div>
      <title>Gespeichert</title>
      <Header>
        <Tabs
          items={[
            { key: "saved", title: "Gespeichert" },
            { key: "viewed", title: "Angesehen" },
          ]}
          selected={selected}
          onSelect={(item) => {
            setSelected(item.key)
            navigate(`/collection?tab=${item.key}`, { replace: true })
          }}
          style={{ margin: "1rem 0.5rem" }}
        />
      </Header>
      <Flex
        direction="column"
        align="stretch"
        style={{ width: "100%", paddingBottom: "6rem" }}
      >
        {empty}
        {loading}
        {selected === "saved" && !(empty || loading) ? (
          <ArticleList articles={savedArticlesQueryData!.savedArticles!} />
        ) : null}
        {selected === "viewed" && !(empty || loading) ? (
          <ArticleList articles={viewedArticlesQueryData!.viewedArticles!} />
        ) : null}
      </Flex>
    </div>
  )
}

import OAuthCallbackClient from "./_components/OAuthCallbackClient";

interface OAuthCallbackPageProps {
  params: Promise<{ provider: string }>;
  searchParams: Promise<{ code?: string; state?: string; error?: string }>;
}

export default async function OAuthCallbackPage({ params, searchParams }: OAuthCallbackPageProps) {
  const { provider } = await params;
  const { code, state, error } = await searchParams;

  return <OAuthCallbackClient provider={provider} code={code} role={state} providerError={error} />;
}

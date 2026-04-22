import { useParams } from 'react-router-dom';

export const EndpointDetailPage = () => {
  const { urlId } = useParams();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">Endpoint Detail</h1>
      <p className="text-muted-foreground mt-1">Viewing endpoint: {urlId}</p>
    </div>
  );
};

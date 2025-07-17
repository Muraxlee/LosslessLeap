"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';

export default function PdfCompressor() {
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Compress PDF</CardTitle>
        <CardDescription>This feature is coming soon!</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg">
        <UploadCloud className="mx-auto h-16 w-16 text-muted-foreground" />
        <p className="mt-4 text-lg font-semibold text-foreground">Feature in development</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We're working hard to bring you the best PDF compression tool.
        </p>
        <Button disabled className="mt-4">
          Select PDF
        </Button>
      </CardContent>
    </Card>
  );
}


"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageToPdf from "@/components/image-to-pdf";
import { FileImage, Combine } from "lucide-react";
import PdfMerger from "./pdf-merger";

export default function PdfTools() {
  return (
    <Tabs defaultValue="image-to-pdf" className="w-full">
      <div className="flex justify-center">
        <TabsList className="mb-6 grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="image-to-pdf">
            <FileImage className="mr-2" />
            Image to PDF
          </TabsTrigger>
          <TabsTrigger value="merge-pdf">
            <Combine className="mr-2" />
            Merge PDF
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="image-to-pdf">
        <ImageToPdf />
      </TabsContent>
      <TabsContent value="merge-pdf">
        <PdfMerger />
      </TabsContent>
    </Tabs>
  );
}

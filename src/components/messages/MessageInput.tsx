import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const MessageInput = () => {
  return (
    <div className="border-t p-4">
      <form className="flex gap-2">
        <Textarea
          placeholder="Écrivez votre message..."
          className="flex-1"
        />
        <Button type="submit">Envoyer</Button>
      </form>
    </div>
  );
};
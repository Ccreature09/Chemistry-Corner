import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { User, onAuthStateChanged } from "firebase/auth";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "@/firebase/firebase";

const formSchema = z.object({
  title: z.string(),
  embed: z.string(),
  picture: z.string(),
});
interface EmbedFormProps {
  grade?: string;
  category: string;
}

const EmbedForm: React.FC<EmbedFormProps> = ({ grade, category }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      embed: "",
      picture: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (user) {
      const embedRef = collection(
        db,
        "embeds",
        category,
        grade || "presentations"
      );
      addDoc(embedRef, {
        title: values.title,
        embed: values.embed,
        picture: values.picture,
      }).catch((error) => {
        console.error("Error adding document: ", error);
      });
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger className="dark:bg-white mb-5 dark:text-black text-sm text-white bg-slate-900 dark:hover:bg-slate-50/90 hover:bg-slate-900/90 w-full py-2 rounded-md">
          Добави Ембед
        </DialogTrigger>

        <DialogContent>
          <Form {...form}>
            <p className="text-5xl font-black mb-8">Embed</p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col gap-3 ">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Заглавие</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Заглавие"
                          {...field}
                          className="w-full p-2 rounded border"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="embed"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Embed Линк</FormLabel>
                      <FormControl>
                        <Textarea
                          className="w-full h-24 p-2 mb-4 border rounded"
                          {...field}
                          placeholder="Ембед"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="picture"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Снимка Линк</FormLabel>
                      <FormControl>
                        <Textarea
                          className="w-full h-24 p-2 mb-4 border rounded"
                          {...field}
                          placeholder="Линк"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogClose asChild>
                <Button
                  type="submit"
                  className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Submit Embed
                </Button>
              </DialogClose>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default EmbedForm;

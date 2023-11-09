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
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase/firebase";

const formSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export default function BlogForm() {
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
      content: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (user) {
      const articlesRef = collection(db, "articles");
      addDoc(articlesRef, {
        author: user.displayName,
        pfp: user.photoURL,
        title: values.title,
        content: values.content,
        status: "pending",
        createdAt: serverTimestamp(),
      }).catch((error) => {
        console.error("Error adding document: ", error);
      });
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger className="dark:bg-white mb-5 dark:text-black text-sm text-white bg-slate-900 dark:hover:bg-slate-50/90 hover:bg-slate-900/90 w-full py-2 rounded-md">
          Create new Blog
        </DialogTrigger>

        <DialogContent>
          <Form {...form}>
            <p className="text-5xl font-black mb-8">Blog</p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col gap-3 ">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Blog Title"
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
                  name="content"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          className="w-full h-24 p-2 mb-4 border rounded"
                          {...field}
                          placeholder="Content"
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
                  Submit Blog
                </Button>
              </DialogClose>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

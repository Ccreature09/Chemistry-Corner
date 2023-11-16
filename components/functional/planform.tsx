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
  name: z.string(),
  picture: z.string(),
  pictures: z.string(),
});

const PlanForm: React.FC = () => {
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
      name: "",
      pictures: "",
      picture: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const picturesArray = values.pictures
      .split(",")
      .map((url: string) => url.trim());
    const newPlan = {
      title: values.name,
      mainPicture: values.picture,
      images: picturesArray,
    };

    try {
      await addDoc(collection(db, "plans"), newPlan);
      console.log("Plan added successfully");
    } catch (error) {
      console.error("Error adding plan:", error);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger className="dark:bg-white mb-5 dark:text-black text-sm text-white bg-slate-900 dark:hover:bg-slate-50/90 hover:bg-slate-900/90 w-full py-2 rounded-md">
          Добави План
        </DialogTrigger>

        <DialogContent>
          <Form {...form}>
            <p className="text-5xl font-black mb-8">План</p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col gap-3 ">
                <FormField
                  control={form.control}
                  name="name"
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
                <FormField
                  control={form.control}
                  name="pictures"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        Линкове към План снимки, разделени със запетая
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className="w-full h-24 p-2 mb-4 border rounded"
                          {...field}
                          placeholder="Снимки"
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
export default PlanForm;

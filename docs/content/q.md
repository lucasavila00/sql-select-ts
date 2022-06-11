const t1 = table(["a", "b", "c"], "t1");
t1.select((f) => ({ a: f.a })).print();

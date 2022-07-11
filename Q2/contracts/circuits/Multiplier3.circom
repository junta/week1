pragma circom 2.0.0;

// [assignment] Modify the circuit below to perform a multiplication of three signals

template Multiplier3 (n1) {  

   // Declaration of signals.  
   signal input a;  
   signal input b;
   
   signal output d;  

   // Constraints.  
   d <== a * b * n1;  
}

component main = Multiplier3(6);
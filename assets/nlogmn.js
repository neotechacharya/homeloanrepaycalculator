 // Set default dates when page loads
        window.onload = function() {
            const today = new Date();
            document.getElementById('loanStartDate').value = today.toISOString().split('T')[0];
            document.getElementById('prepaymentStartDate').value = today.toISOString().split('T')[0];
        }

        const modal = document.getElementById('resultsModal');

        function showResults() {
            calculateLoan();
            modal.style.display = 'flex';
        }

        function closeModal() {
            modal.style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target === modal) {
                closeModal();
            }
        }

        function calculateLoan() {
            const loanAmount = Number(document.getElementById('loanAmount').value);
            const interestRate = Number(document.getElementById('interestRate').value);
            const loanTerm = Number(document.getElementById('loanTerm').value);
            const prepaymentAmount = Number(document.getElementById('prepaymentAmount').value);
            const loanStartDate = new Date(document.getElementById('loanStartDate').value);
            const prepaymentStartDate = new Date(document.getElementById('prepaymentStartDate').value);
            const prepaymentType = document.querySelector('input[name="prepaymentType"]:checked').value;

            // Calculate months between loan start and prepayment start
            const startMonth = Math.ceil((prepaymentStartDate - loanStartDate) / (1000 * 60 * 60 * 24 * 30)) + 1;

            // Calculate monthly interest rate
            const monthlyRate = interestRate / (12 * 100);
            const totalMonths = loanTerm;

            // Calculate regular EMI
            const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / 
                       (Math.pow(1 + monthlyRate, totalMonths) - 1);

            // Calculate loan details without prepayment
            const regularLoanDetails = calculateAmortization(loanAmount, monthlyRate, totalMonths, 0, 0, 'oneTime');

            // Calculate loan details with prepayment
            const prepaymentLoanDetails = calculateAmortization(loanAmount, monthlyRate, totalMonths, 
                                                              prepaymentAmount, startMonth, prepaymentType);

            // Update results
            document.getElementById('emiResult').textContent = formatCurrency(emi);
            document.getElementById('totalInterestResult').textContent = formatCurrency(regularLoanDetails.totalInterest);
            document.getElementById('newTermResult').textContent = `${prepaymentLoanDetails.months} months`;
            document.getElementById('newInterestResult').textContent = formatCurrency(prepaymentLoanDetails.totalInterest);
            document.getElementById('savingsResult').textContent = 
                `Total Savings: ${formatCurrency(regularLoanDetails.totalInterest - prepaymentLoanDetails.totalInterest)}`;
        }

        function calculateAmortization(principal, monthlyRate, totalMonths, prepaymentAmount, startMonth, prepaymentType) {
            let balance = principal;
            let totalInterest = 0;
            let months = 0;

            const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / 
                                 (Math.pow(1 + monthlyRate, totalMonths) - 1);

            while (balance > 0 && months < totalMonths) {
                months++;
                const interest = balance * monthlyRate;
                totalInterest += interest;

                let payment = monthlyPayment;
                
                // Add prepayment if applicable
                if (months >= startMonth) {
                    if (prepaymentType === 'oneTime' && months === startMonth) {
                        payment += prepaymentAmount;
                    } else if (prepaymentType === 'monthly') {
                        payment += prepaymentAmount;
                    }
                }

                const principal = payment - interest;
                balance = Math.max(0, balance - principal);
            }

            return {
                months: months,
                totalInterest: totalInterest
            };
        }

        function formatCurrency(amount) {
            return '₹' + Math.round(amount).toLocaleString('en-IN');
        }
